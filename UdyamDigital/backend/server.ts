import express from "express";
import cors from "cors";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

type Product = {
  product_id: string; product_name: string; description: string; unit: string;
  category: string; price_min_inr_per_month: number; price_max_inr_per_month: number;
  one_time_setup_inr: number; min_contract_months: number; available_city_tiers: number[];
  min_employees: number; min_sites: number; requires_gstin: boolean;
  requires_one_of: string[]; typical_install_days: number; target_segments: string[];
};
type Profile = { businessName: string; businessType: string; segment: "micro"|"prof"|"multi"|"mfg"; city: string; state: string; cityTier: 1|2; employeeCount: number; siteCount: number; gstinStatus: "absent"|"active"|"suspended"|"cancelled"|"not_found"|"invalid"; udyam?: string; language: string; provider?: string; monthlySpend?: number };
type KycCase = { id: string; status: "PENDING"|"IN_REVIEW"|"NEEDS_CORRECTION"|"COMPLETED"|"REJECTED"; consent: boolean; documents: string[]; reason?: string };
const root = path.resolve(process.cwd());
const dataPath = path.join(root, "source", "data_package");
const csv = (name: string) => parse(readFileSync(path.join(dataPath, name), "utf8"), { columns: true, skip_empty_lines: true }) as Record<string,string>[];
const products: Product[] = csv("product_catalogue.csv").map((p) => ({
  product_id: p.product_id, product_name: p.product_name, description: p.description, unit: p.unit, category: p.category,
  price_min_inr_per_month: Number(p.price_min_inr_per_month), price_max_inr_per_month: Number(p.price_max_inr_per_month),
  one_time_setup_inr: Number(p.one_time_setup_inr), min_contract_months: Number(p.min_contract_months),
  available_city_tiers: p.available_city_tiers.split(";").map(Number), min_employees: Number(p.min_employees), min_sites: Number(p.min_sites),
  requires_gstin: p.requires_gstin === "Y", requires_one_of: p.requires_one_of ? p.requires_one_of.split("|") : [],
  typical_install_days: Number(p.typical_install_days), target_segments: p.target_segments.split(";")
}));
const gst = new Map(csv("mock_gstin_registry.csv").map((r) => [r.gstin.toUpperCase(), r.status.toLowerCase()]));
const udyam = new Map(csv("mock_udyam_registry.csv").map((r) => [r.udyam_number.toUpperCase(), r]));
const leads = csv("smb_leads.csv");
const profiles = new Map<string, Profile>();
const quotes = new Map<string, any>();
const cases = new Map<string, KycCase>();
const orders = new Map<string, any>();
const upload = multer({ dest: path.join(root, ".uploads"), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ["image/png","image/jpeg","application/pdf"].includes(file.mimetype)) });
const app = express(); app.use(cors()); app.use(express.json({ limit: "1mb" }));
const segmentLabels: Record<string, Profile["segment"]> = { "Micro retail & services": "micro", "Professional offices": "prof", "Small multi-site": "multi", "Small manufacturers": "mfg", micro: "micro", prof: "prof", multi: "multi", mfg: "mfg" };
const id = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const requireReviewer = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.header("x-demo-role") !== "reviewer") return res.status(403).json({ error: "REVIEWER_ROLE_REQUIRED" });
  next();
};
const reason = (code: string, message: string, details?: object) => ({ code, message, details });
function eligibility(profile: Profile, product: Product, bundle: string[] = [], contract?: number) {
  const reasons = []; const warnings = [];
  if (!product.available_city_tiers.includes(profile.cityTier)) reasons.push(reason("CITY_TIER_UNAVAILABLE", "Product is not available in this city tier."));
  if (profile.employeeCount < product.min_employees) reasons.push(reason("EMPLOYEE_MINIMUM_NOT_MET", `Requires at least ${product.min_employees} employees.`));
  if (profile.siteCount < product.min_sites) reasons.push(reason("SITE_MINIMUM_NOT_MET", `Requires at least ${product.min_sites} site(s).`));
  if (product.requires_gstin && profile.gstinStatus !== "active") reasons.push(reason("GSTIN_REQUIRED", "An Active GSTIN is required."));
  if (contract !== undefined && contract < product.min_contract_months) reasons.push(reason("CONTRACT_TOO_SHORT", `Minimum contract is ${product.min_contract_months} months.`));
  if (product.requires_one_of.length && !product.requires_one_of.some((x) => bundle.includes(x))) reasons.push(reason("DEPENDENCY_NOT_MET", `Requires one of: ${product.requires_one_of.join(", ")}.`));
  if (!product.target_segments.includes(profile.segment) && reasons.length === 0) warnings.push(reason("TARGET_SEGMENT_MISMATCH", "This product is outside the primary target segment."));
  return { eligible: reasons.length === 0, reasons, warnings, relevanceScore: Math.max(0, 1 - (warnings.length ? .4 : 0)) };
}
function mid(p: Product) { return Math.round((p.price_min_inr_per_month + p.price_max_inr_per_month) / 2); }
function quote(profile: Profile, itemInput: { productId: string; quantity: number }[], contractMonths: number) {
  const bundle = itemInput.map((x) => x.productId); const items = itemInput.map((input) => {
    const p = products.find((x) => x.product_id === input.productId); if (!p) throw new Error("PRODUCT_UNKNOWN");
    const check = eligibility(profile, p, bundle, contractMonths); if (!check.eligible) throw new Error(check.reasons.map((x) => x.code).join(","));
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error("INVALID_QUANTITY");
    return { productId: p.product_id, productName: p.product_name, unit: p.unit, quantity: input.quantity, unitMonthlyPrice: mid(p), setupUnitPrice: p.one_time_setup_inr, recurring: mid(p) * input.quantity, setup: p.one_time_setup_inr * input.quantity };
  });
  return { items, monthlyRecurringTotalInr: items.reduce((s, x) => s + x.recurring, 0), oneTimeSetupTotalInr: items.reduce((s, x) => s + x.setup, 0), firstMonthBeforeTaxInr: items.reduce((s, x) => s + x.recurring + x.setup, 0), installEstimateDays: Math.max(...items.map((x) => products.find((p) => p.product_id === x.productId)!.typical_install_days)), contractMonths };
}
const profileSchema = z.object({ businessName: z.string().min(2), businessType: z.string().min(2), segment: z.string(), city: z.string().min(2), state: z.string().min(2), cityTier: z.union([z.literal(1), z.literal(2)]), employeeCount: z.number().int().min(1), siteCount: z.number().int().min(1), gstinStatus: z.enum(["absent","active","suspended","cancelled","not_found","invalid"]), udyam: z.string().optional(), language: z.string().default("en-IN"), provider: z.string().optional(), monthlySpend: z.number().int().min(0).optional() });
app.get("/api/health", (_req, res) => res.json({ ok: true, database: "local-demo-fallback", catalogueProducts: products.length }));
app.get("/api/catalogue", (_req, res) => res.json(products));
app.post("/api/profile", (req, res) => { const result = profileSchema.safeParse({ ...req.body, segment: segmentLabels[String(req.body.segment)] }); if (!result.success) return res.status(400).json({ error: "VALIDATION_ERROR", details: result.error.flatten() }); const profile = result.data as Profile; const profileId = id("biz"); profiles.set(profileId, profile); res.json({ profileId, profile }); });
app.post("/api/recommendations", (req, res) => { const profile = profiles.get(req.body.profileId); if (!profile) return res.status(404).json({ error: "PROFILE_NOT_FOUND" }); const result = products.map((p) => ({ ...p, ...eligibility(profile, p, req.body.productIds ?? [], req.body.contractMonths) })).sort((a,b) => Number(b.eligible) - Number(a.eligible) || b.relevanceScore - a.relevanceScore); res.json({ profileId: req.body.profileId, eligible: result.filter((x) => x.eligible), excluded: result.filter((x) => !x.eligible) }); });
app.post("/api/quotes/preview", (req, res) => { try { const profile = profiles.get(req.body.profileId); if (!profile) return res.status(404).json({ error: "PROFILE_NOT_FOUND" }); res.json({ valid: true, ...quote(profile, req.body.items, req.body.contractMonths), pricePolicy: "MIDPOINT_MATH_ROUND_POSITIVE_INR_SETUP_PER_UNIT" }); } catch (e) { res.status(422).json({ error: "QUOTE_INVALID", message: String(e instanceof Error ? e.message : e) }); } });
app.post("/api/quotes", (req, res) => { try { const profile = profiles.get(req.body.profileId); if (!profile) return res.status(404).json({ error: "PROFILE_NOT_FOUND" }); const data = quote(profile, req.body.items, req.body.contractMonths); const quoteId = id("quote"); const record = { quoteId, reference: `UDY-${quoteId.slice(-8).toUpperCase()}`, status: "DRAFT", expiresAt: new Date(Date.now() + 86400000).toISOString(), ...data }; quotes.set(quoteId, record); res.json(record); } catch (e) { res.status(422).json({ error: "QUOTE_INVALID", message: String(e instanceof Error ? e.message : e) }); } });
app.post("/api/quotes/:id/accept", (req, res) => { const q = quotes.get(req.params.id); if (!q || new Date(q.expiresAt) < new Date()) return res.status(409).json({ error: "QUOTE_EXPIRED_OR_NOT_FOUND" }); q.status = "ACCEPTED"; q.acceptedAt = new Date().toISOString(); res.json(q); });
app.post("/api/kyc", (req, res) => { const caseId = id("kyc"); cases.set(caseId, { id: caseId, status: "PENDING", consent: false, documents: [] }); res.json(cases.get(caseId)); });
app.post("/api/kyc/:id/consent", (req, res) => { const c = cases.get(req.params.id); if (!c || req.body.granted !== true) return res.status(422).json({ error: "CONSENT_REQUIRED" }); c.consent = true; res.json(c); });
app.post("/api/kyc/:id/registry", (req, res) => { const c = cases.get(req.params.id); if (!c?.consent) return res.status(403).json({ error: "CONSENT_REQUIRED" }); const registry = String(req.body.registry ?? "GSTIN").toUpperCase(); const value = String(req.body.identifier ?? "").trim().toUpperCase(); if (registry === "UDYAM") { const formatStatus = /^UDYAM-[A-Z]{2}-00-[0-9]{7}$/.test(value) ? "VALID_FORMAT" : "FORMAT_INVALID"; return res.json({ registry, maskedIdentifier: value.length > 6 ? `${value.slice(0,6)}••••••${value.slice(-2)}` : "••••", formatStatus, lookupStatus: formatStatus === "VALID_FORMAT" && udyam.has(value) ? "matched" : "not_found" }); } const status = gst.get(value) ?? "not_found"; res.json({ registry, maskedIdentifier: value.length > 4 ? `${value.slice(0,2)}••••••••${value.slice(-2)}` : "••••", formatStatus: /^[0-9]{2}[A-Z0-9]{13}$/.test(value) ? "VALID_FORMAT" : "FORMAT_INVALID", lookupStatus: status }); });
app.post("/api/kyc/:id/documents", upload.single("document"), (req, res) => { const c = cases.get(String(req.params.id)); if (!c?.consent) return res.status(403).json({ error: "CONSENT_REQUIRED" }); if (!req.file) return res.status(400).json({ error: "UNSUPPORTED_OR_MISSING_FILE" }); const documentType = String(req.body.documentType ?? "OTHER"); c.documents.push(documentType); res.json({ documentType, status: "UPLOADED", demoExtraction: "MOCK_EXTRACTION" }); });
app.post("/api/kyc/:id/submit", (req, res) => { const c = cases.get(String(req.params.id)); if (!c?.consent) return res.status(403).json({ error: "CONSENT_REQUIRED" }); if (c.documents.length === 0) { c.status = "NEEDS_CORRECTION"; c.reason = "MISSING_DOCUMENT"; return res.status(422).json(c); } c.status = "IN_REVIEW"; res.json(c); });
app.post("/api/kyc/:id/review", requireReviewer, (req, res) => { const c = cases.get(String(req.params.id)); if (!c) return res.status(404).json({ error: "KYC_NOT_FOUND" }); if (req.body.decision === "ACCEPT" && (c.status !== "IN_REVIEW" || c.documents.length === 0)) return res.status(422).json({ error: "KYC_EVIDENCE_INCOMPLETE" }); c.status = req.body.decision === "ACCEPT" ? "COMPLETED" : req.body.decision === "REJECT" ? "REJECTED" : "NEEDS_CORRECTION"; c.reason = req.body.reason; res.json(c); });
app.post("/api/orders", (req, res) => { const q = quotes.get(req.body.quoteId); const c = cases.get(req.body.kycCaseId); if (!q || q.status !== "ACCEPTED" || new Date(q.expiresAt) < new Date()) return res.status(422).json({ error: "ACCEPTED_VALID_QUOTE_REQUIRED" }); if (!c || c.status !== "COMPLETED") return res.status(422).json({ error: "COMPLETED_KYC_REQUIRED" }); const order = { orderId: id("order"), publicReference: `ORD-${Date.now().toString().slice(-8)}`, status: "ORDER_CONFIRMED", quoteId: q.quoteId, kycCaseId: c.id, timeline: [{ status: "ORDER_CONFIRMED", at: new Date().toISOString() }] }; orders.set(order.orderId, order); res.json(order); });
app.post("/api/orders/:id/events", requireReviewer, (req, res) => { const o = orders.get(String(req.params.id)); const allowed: Record<string,string[]> = { ORDER_CONFIRMED: ["INSTALLATION_SCHEDULED"], INSTALLATION_SCHEDULED: ["INSTALLATION_COMPLETED"], INSTALLATION_COMPLETED: ["ACTIVATED"] }; if (!o || !allowed[o.status]?.includes(req.body.toStatus)) return res.status(409).json({ error: "INVALID_ORDER_TRANSITION" }); o.status = req.body.toStatus; o.timeline.push({ status: o.status, at: new Date().toISOString() }); res.json(o); });
app.get("/api/orders/:id", (req, res) => { const o = orders.get(String(req.params.id)); o ? res.json(o) : res.status(404).json({ error: "ORDER_NOT_FOUND" }); });
app.get("/api/analytics", requireReviewer, (_req, res) => { const activated = leads.filter((x) => x.activated_date).length; res.json({ historical: { leads: leads.length, activated, conversion: `${((activated / leads.length) * 100).toFixed(2)}%`, blendedAcquisitionCost: 15053.37 }, live: { profiles: profiles.size, quotes: quotes.size, orders: orders.size, kycCases: cases.size } }); });
app.post("/api/demo/expire-quote", requireReviewer, (req, res) => { const q = quotes.get(String(req.body.quoteId)); if (!q) return res.status(404).json({ error: "QUOTE_NOT_FOUND" }); q.expiresAt = new Date(Date.now() - 1000).toISOString(); res.json({ quoteId: q.quoteId, expiresAt: q.expiresAt }); });
app.post("/api/demo/reset", requireReviewer, (_req, res) => { profiles.clear(); quotes.clear(); cases.clear(); orders.clear(); res.json({ reset: true, message: "In-memory demo state cleared; CSV seed data remains available." }); });
app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => { if (res.headersSent) return next(error); res.status(400).json({ error: "UPLOAD_OR_REQUEST_INVALID", message: error instanceof Error ? error.message : "Request could not be processed." }); });
const frontend = path.join(root, "frontend", "dist"); app.use(express.static(frontend)); app.use((_req, res) => res.sendFile(path.join(frontend, "index.html")));
app.listen(Number(process.env.PORT ?? 3000), () => console.log("Udyam Digital running at http://localhost:3000 (local demo fallback; PostgreSQL unavailable)"));

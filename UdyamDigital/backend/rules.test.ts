import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
const rows = parse(readFileSync("source/data_package/product_catalogue.csv"), { columns: true }) as Record<string,string>[];
assert.equal(rows.length, 25);
assert.deepEqual(rows.filter((x) => x.requires_one_of).map((x) => x.product_id), ["P09","P10","P11","P12","P21","P22","P23"]);
assert.equal(rows.find((x) => x.product_id === "P06")?.min_contract_months, "24");
assert.equal(rows.find((x) => x.product_id === "P14")?.requires_gstin, "Y");
console.log("Catalogue rule tests passed: 25 products, 7 dependencies, P06=24 months, P14=GSTIN required.");

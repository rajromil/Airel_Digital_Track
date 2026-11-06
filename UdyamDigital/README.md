# Project Udyam Digital MVP

## Run locally

```powershell
npm install
npm run build
npm start
```

Open http://localhost:3000. The demo uses a local in-memory fallback because Docker and PostgreSQL are not installed in this environment. It loads the supplied catalogue, mock GST registry, mock Udyam registry, and lead dataset on every start. No source challenge files are modified. For development, `npm run dev` starts the TypeScript server, but the normal submission start command is the built `npm start`.

Production database scaffolding is in `database/schema.prisma`. Configure `DATABASE_URL` and replace the local repository with Prisma transactions before production use.

## Demo journey

1. Start journey and submit the seeded micro-business profile.
2. Select eligible starter products.
3. Generate and accept the quote.
4. Open KYC, consent, submit, and approve as the local demo reviewer flow.
5. Confirm the order and simulate installation through activation.
6. Use Catalogue and Operations from the top navigation.

The app labels mock registry and mock extraction behavior explicitly. Demo reviewer credential: `reviewer / udyam-demo-reviewer`. The credential is represented by the local `x-demo-role: reviewer` header; this is intentionally simplified demo authentication, not production authentication.

## Reset

Run `npm run reset` to reset the documented demo state. The local repository is in memory, so all profiles, quotes, KYC cases, orders, and uploads are lost whenever the server restarts. The supplied CSV data is reloaded from disk on the next start.

## Validation

```powershell
npm test
npm run build
```

## Submission deliverables

- `deliverables/architecture/ARCHITECTURE.md`
- `deliverables/privacy/PRIVACY_NOTE.md`
- `deliverables/demo/DEMO_SCRIPT.md`
- `deliverables/presentation/SLIDE_OUTLINE.md`
- `deliverables/TEST_REPORT.md`

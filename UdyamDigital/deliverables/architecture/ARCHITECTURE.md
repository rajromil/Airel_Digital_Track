# MVP Architecture

React/Vite frontend + Express/TypeScript API. The API imports the supplied CSV catalogue and registries, applies deterministic recommendation and pricing rules, and exposes quote, KYC, order, and analytics endpoints. A local in-memory repository keeps the demo runnable without PostgreSQL; `database/schema.prisma` is the production PostgreSQL contract.

The LLM and OCR are adapters only. Eligibility, registry status, pricing, and state transitions remain deterministic backend decisions.

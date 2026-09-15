<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Architecture Guide
For this app, read the architecture guide in .agents/ARCHITECTURE.md
It describes the app's structure, conventions, and how to add new features. It is a living document that should be updated as the app evolves.

# Hosted Supabase project
The hosted project (`tasks-app`, ref `vlnfrmutlsayaohrloqa`) has **automatic table exposure disabled** and **RLS disabled**. New tables in the `public` schema are NOT reachable over the Data API until the developer manually exposes them in the dashboard (Project Settings -> API -> expose table). Whenever DB access to a new table is added, remind the developer to expose it manually there. (RLS is intentionally off for now; revisit when auth/multi-tenancy is added.)

# Git workflow
This is a public repo and `main` is protected with pull request review required. Never commit or push directly to `main`. Always create a short-lived branch, open a pull request, and wait for the developer to review and merge it.

# Acceptance testing (test-first)
Every feature goes through the test-first loop: write the feature's Playwright specs BEFORE implementing, watch them fail (red), implement, watch them pass (green). The specs then stay as regression coverage.

All specs run against the LOCAL Supabase stack (`http://127.0.0.1:54321`) only — never the hosted project. The test harness injects local env vars and refuses to run if they point at hosted.

Rules every spec must follow:
- **Self-provision** — a spec creates, via its own acceptance boundary (UI for browser specs, API for API specs), exactly the data and state it asserts on. A spec may use test helpers for cleanup, verification, or restoring unrelated state, but must not use another application boundary to perform the behavior under test. A spec may depend on schema (migrations) but never on data (seed rows or anything else already in the DB). A migration may add a column or insert a baseline row (e.g. a new setting); feature defaults live in migrations, not the seed.
- **Boundary independence** — API and browser acceptance tests are independent acceptance boundaries. An API spec must exercise the feature through the API and verify its API contract end to end; a browser spec must exercise the user-visible workflow through the browser and verify its UI behavior end to end. Never use one boundary to set up, modify, or complete the behavior tested at the other boundary.
- **Marker discipline** — rows a spec creates are tagged with a unique marker (`[atd:<feature>]`) so assertions find only that spec's data, and proactive cleanup deletes only that spec's rows — never seed data or manual rows.
- **Seed-agnostic** — never assert totals or specific rows of a table the spec did not provision. Seeds may change without notice.
- **Restore, don't reset** — singleton state (e.g. `app_settings`) is read → asserted → restored to its previous value.

Generic helpers live in `e2e/helpers/` (markers, cleanup, restore) and are config-driven; a bigger or forked app changes a small table manifest, not the machinery.

Commands:
- Feature loop: `npm run test:e2e -- e2e/<feature>` — runs only that feature's specs.
- Full suite (post-merge / sanity): `npm run test:e2e`
- Regression (occasional, before releases/refactors): `npm run test:e2e:regression` — `supabase db reset` then the full suite.

Database blast radius:
- Behavior/UI-only feature → no DB action; specs self-provision on the running local stack.
- Schema change (new migration) → apply only that migration locally (`supabase migration up`); other data untouched.
- Seed-semantics change that tests depend on → full `supabase db reset` (deliberate, rare).

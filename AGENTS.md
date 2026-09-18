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

After every merge, sync local `main` before any new work: `git checkout main && git pull --ff-only`. GitHub's **Rebase and Merge** re-stamps merged commits with fresh committer metadata, so the hashes on `main` differ from the ones you pushed — never branch from, base a PR on, or tag a pre-merge feature/release commit. The only trustworthy snapshot of the merged result is post-merge `main`.

# Releases
Cut a release only when `main` holds everything intended. PRs are merged with **Rebase and Merge** on GitHub (never squash) — GitHub keeps history linear (no merge commits) but re-stamps each commit, so the hashes on `main` differ from the PR branch's. Expect that; it is normal.

Steps for each release (vX.Y.Z):
1. Sync `main` (`git checkout main && git pull --ff-only`), then branch: `git switch -c chore/release-vX.Y.Z`.
2. Make a NON-empty chore commit announcing the release: append a short "Releases" entry at the end of `README.md` describing what this release marks or ships. The commit must carry a real diff — never an empty or `--allow-empty` announce commit.
3. Open a pull request and remind the developer to merge it with **Rebase and Merge**, not squash (squash collapses the commit). Remember the merged hash will differ from yours — confirm against post-merge `main`.
4. Sync `main` again after the merge, then tag the post-merge `main` commit with an annotated tag and push it:
   `git tag -a vX.Y.Z -m "Release vX.Y.Z — <short title>" && git push origin vX.Y.Z`
5. Publish the release with notes in the established style (`## vX.Y.Z — `<Title>``, `### What's included` bullets, `### Operations notes`):
   `gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <notes.md>`
6. DB migrations: NEVER push to the hosted project automatically. When a PR ships a migration, ask the developer for explicit approval first — they review the feature on the local stack and the PR code before anything touches the hosted DB, and un-pushing a hosted migration is messy. Only after approval, run `supabase db push`. Expect the sequence: the Vercel preview auto-deploys on PR creation and may be runtime-broken until the migration is pushed; pushing it fixes the preview but can break production until the PR merges and Vercel redeploys. Supabase↔GitHub migration deploys are NOT enabled; migrations are applied manually.

# Acceptance testing (test-first)
Every feature goes through the test-first loop: write the feature's Playwright specs BEFORE implementing, watch them fail (red), implement, watch them pass (green). The specs then stay as regression coverage.

All specs run against the LOCAL Supabase stack (`http://127.0.0.1:54321`) only — never the hosted project. The test harness injects local env vars and refuses to run if they point at hosted.

Rules every spec must follow:
- **Self-provision** — a spec creates, via its own acceptance boundary (UI for browser specs, API for API specs), exactly the data and state it asserts on. A spec may use test helpers for cleanup, verification, or restoring unrelated state, but must not use another application boundary to perform the behavior under test. A spec may depend on schema (migrations) but never on data (seed rows or anything else already in the DB). A migration may add a column or insert a baseline row (e.g. a new setting); feature defaults live in migrations, not the seed.
- **Boundary independence** — API and browser acceptance tests are independent acceptance boundaries. An API spec must exercise the feature through the API and verify its API contract end to end; a browser spec must exercise the user-visible workflow through the browser and verify its UI behavior end to end. Never use one boundary to set up, modify, or complete the behavior tested at the other boundary.
- **Business-logic coverage** — every piece of business logic ships with test cases that exercise it, and business-logic changes ship with their test cases updated alongside the code in the same change. Test coverage evolves with the logic, never lags it.
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

# Handoff — dev environment moves to a VPS

Date: 2026-09-29

## 1. What tasks-app is and its stack

tasks-app is a small task-tracking app: add, edit, complete, and archive tasks with priorities (low/medium/high) and a light/dark theme. It is a Next.js (16, App Router) + React 19 + TypeScript app styled with Tailwind v4 and base-ui/shadcn components (lucide icons). Data lives in Supabase (Postgres); auth is Supabase Auth with email/password — cookie sessions on the web via `@supabase/ssr`, bearer tokens over the HTTP API. Local development runs the whole Supabase stack on Docker through the Supabase CLI. The code is a modular monolith (`src/modules/{tasks,settings,auth}`) following the layering in `.agents/ARCHITECTURE.md`: pages and Server Actions call the domain, the domain calls the DAL, the DAL talks to Supabase; API routes are transport for future Mobile/CLI clients.

## 2. Where things live

- **Architecture guide**: `.agents/ARCHITECTURE.md` (living doc) — modular monolith, "callers compose domains; domains own business rules", DAL = database access only, API = transport layer, multi-user/multi-tenant safety (no module-scoped request state).
- **Acceptance harness**: `e2e/` — `playwright.config.ts` defines an `api` and a `browser` project and refuses to run against hosted Supabase (injects local env, always targets `http://127.0.0.1:54321`). Helpers in `e2e/helpers/` (`db.ts` `cleanupFeatureRows`, `marker.ts` `[atd:<feature>]`, `auth.ts` `createTestUser`/`createAuthenticatedRequestContext`, `supabase.ts` local env). Commands: `npm run test:e2e` (feature-scoped: `npm run test:e2e -- e2e/<feature>`), `npm run test:e2e:regression` (does `supabase db reset` first). Every feature ships its Playwright specs first (red), then the implementation (green); the specs stay as regression coverage.
- **Migrations/seed**: `supabase/migrations/` — `create_tasks`, `add_task_state_and_settings`, `add_task_priority` — applied automatically by `npx supabase start` / `supabase db reset`. `supabase/seed.sql` seeds demo rows. Feature defaults belong in migrations, never the seed; specs are seed-agnostic and self-provision their own rows.
- **Hosted Supabase exposure note**: the hosted project (`tasks-app`, ref `vlnfrmutlsayaohrloqa`) has **automatic table exposure disabled** and **RLS disabled**. New tables in the `public` schema are NOT reachable over the Data API until manually exposed in the dashboard (Project Settings → API → expose table). RLS is intentionally off for now; revisit when multi-tenancy lands.

## 3. What has shipped and what is open

**Releases**
- `v0.1.0` — initial release.
- `v0.2.0` — ATDD milestone: every feature ships with Playwright acceptance specs across the browser and API boundaries, written before implementation.

**Merged slices** (all on `main`, merged via Rebase and Merge)
- #3 — Playwright acceptance harness (api + browser boundaries, helpers, marker discipline).
- #4 — Task priority (low/medium/high).
- #7 — Email/password auth for the web (sign up, sign in, sign out).
- #8 — Bearer-token auth for the HTTP API + `GET /api/me` (identity only; rows are not yet user-scoped).
- Docs PRs: #1 (AGENTS.md Supabase exposure + pull-request workflow), #6 (release steps in AGENTS.md).

**Open right now**: none. `main` is at `4c7b8a0`; PR #8 is merged and reviewed. Next work starts from a fresh short-lived branch off freshly-pulled `main`.

## 4. What's next

Planned slices, in rough order — each ships with its Playwright specs through the ATDD loop (red → green, self-provisioning, marker discipline) and follows the repo/ops rules (short-lived branch, PR, Rebase and Merge, explicit approval for any hosted migration).

1. **Row ownership / user-scoped tasks** — add `user_id` to tasks, migrate, scope reads/writes to the authenticated caller (`requireApiUser` in `src/lib/api-auth.ts`); enable RLS afterward. This is the biggest slice and the first that makes API auth meaningful for data isolation.
2. **Hosted hand-off** — expose tables in the hosted dashboard and, with explicit approval, run a `supabase db push`. Expect the sequence: Vercel preview auto-deploys on PR creation and may be runtime-broken until the migration is pushed; pushing fixes preview but can break production until the PR merges and Vercel redeploys.
3. **Ongoing API/UX polish** as specs surface it (e.g. hardening `GET /api/me`).

## 5. Context of this handoff

The developer's dev environment moves from the laptop to a headless Hetzner Linux VPS (Ubuntu) so it can run unattended with the laptop off. The README section **"Dev environment on a VPS (headless Linux)"** is the setup reference: baseline packages, Docker Engine + Compose plugin from Docker's official apt repo, Node via nvm (>= 20.9.0, engine-pinned in `package.json`), the GitHub CLI authenticated as Vakya, clone + `npm install`, `npx supabase start`/`status`, `.env.local`, `npm run dev` on :3000, the `ufw allow 3000/tcp` firewall note, and tmux/systemd for keeping it alive after SSH logout. Local Supabase runs on the box; nothing hosted changes.

## 6. Risks / ops notes

- **GitHub identity must be Vakya** (`vakya-sutra`). Check `gh auth status` before any remote task; the laptop currently has both `vakya-sutra` and `radlakha` logged in, and the VPS account must be set up as Vakya as well. Never switch the active account yourself — stop and ask the developer.
- **Hosted migrations require explicit approval** — never push to the hosted project automatically; un-pushing a hosted migration is messy. The developer reviews the feature on the local stack and the PR code before anything touches hosted.
- **Manual table exposure** — automatic exposure is disabled on the hosted project; every new public table needed over the Data API has to be exposed by hand in the dashboard (and RLS is still off).
- **Nondeterminisms noticed**:
  - Right after `supabase db reset`, the full parallel suite occasionally flakes a couple of specs on the first attempt (the 1-retry pass succeeds) — the regression run is not 100% deterministic.
  - Repo-wide `npm run lint` reports ~3054 pre-existing problems on `HEAD` (vendored/legacy noise) — lint only changed files.
  - The Supabase CLI prints "new version available" notices; keep the local CLI/images at intended versions to avoid surprise drift.
  - Rebase and Merge re-stamps commit hashes, so merged `main` hashes differ from the pushed branch — never branch from, base a PR on, or tag a pre-merge commit.
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
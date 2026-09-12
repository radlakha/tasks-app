# Tasks

A small task-tracking app built with Next.js. Tasks and app preferences are stored in Supabase (Postgres). Use it to add, edit, complete, and archive tasks, with a light/dark theme.

## Prerequisites

- Node.js >= 20.9.0
- npm
- Docker (required for local Supabase)
- A Supabase project, either local (via the Supabase CLI) or hosted

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and fill in the Supabase values:

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Local Supabase

The local database runs with the Supabase CLI on Docker:

```bash
npx supabase start    # start the local stack (migrations + seed applied)
npx supabase status   # show the local URLs and keys
npx supabase stop     # stop the local stack
```

Copy the local API URL (e.g. `http://127.0.0.1:54321`) and the anon/publishable key into the two variables in `.env.local`.

## Deployment

### Prerequisites

- A hosted Supabase project
- A Vercel project

### Steps

1. Link the repo to your hosted Supabase project and apply the migrations:

   ```bash
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

2. In your Vercel project, add the hosted project values for these environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Import this repository into Vercel and deploy.
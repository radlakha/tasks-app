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

## Dev environment on a VPS (headless Linux)

Set up the dev environment on a fresh Ubuntu machine (e.g. a Hetzner VPS) so it runs unattended while the developer's laptop is off. Supabase and the dev server both run on this one box.

1. Update the base image and install the basics:

   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl git unzip ufw
   ```

2. Install Docker Engine and the Compose plugin from Docker's official apt repository (Docker Desktop does not exist on Linux):

   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo systemctl enable --now docker
   sudo usermod -aG docker $USER   # then log out and back in so the group applies
   sudo docker run hello-world    # verify the daemon works
   ```

3. Install Node.js >= 20.9.0 with nvm (apt's Node is too old); npm ships with it:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   node -v   # should print v20.9.0 or newer
   ```

4. Install the GitHub CLI and authenticate as Vakya (the repo's git identity):

   ```bash
   (type -p wget >/dev/null || (sudo apt update && sudo apt install -y wget)) \
   && sudo mkdir -p -m 755 /etc/apt/keyrings \
   && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
   && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
   && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
   && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
   && sudo apt update && sudo apt install -y gh
   gh auth login   # sign in as Vakya (vakya-sutra)
   ```

5. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/radlakha/tasks-app.git && cd tasks-app
   npm install
   ```

6. Start the local Supabase stack (pulls the Docker images) and read its URLs/keys:

   ```bash
   npx supabase start    # migrations + seed applied
   npx supabase status
   ```

7. Create `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `npx supabase status`:

   ```bash
   cp .env.example .env.local
   ```

8. Run the dev server and verify, then open the firewall port if you browse from another machine:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). To reach it from another machine:

   ```bash
   sudo ufw allow 3000/tcp
   ```

9. Keep it running without a laptop. The simplest option is tmux, which survives SSH logout:

   ```bash
   tmux new -s dev -d "npx supabase start && npm run dev"
   tmux attach -t dev   # to get back to it
   ```

   For persistence across reboots, run the dev server as a small systemd unit instead; the Supabase stack itself stays up once started with `npx supabase start`.

Hosted/prod deployment is the separate [Deployment](#deployment) flow below — the VPS above is just the dev environment.

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

## Releases

### v0.2.0 — Acceptance Test Driven Development

This release marks the point in development where we established Acceptance Test Driven Development (ATDD): every feature ships with Playwright acceptance specs — spanning the browser and API acceptance boundaries — written before the implementation and kept as regression coverage (`npm run test:e2e`).
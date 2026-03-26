# Deployment Guide

Anchor is deployed on a VPS using Docker, managed by [Dokploy](https://dokploy.com) — a self-hosted PaaS that handles reverse proxying, HTTPS, domain routing, and automated deploys.

---

## Architecture

```
VPS
├── Dokploy          (manages everything below)
│   └── Traefik      (reverse proxy, HTTPS, domain routing)
└── anchor           (this app, running in Docker)

VPS filesystem
├── /data/anchor/db/      → SQLite database (bind-mounted into container)
└── /data/anchor/vault/   → Notes git repo (bind-mounted into container)
```

Pushing to `main` triggers an automatic redeploy via GitHub webhook.

---

## Prerequisites

- A VPS running Ubuntu 20.04+ or Debian 11+ (2GB RAM minimum, 4GB recommended)
- A domain name with DNS pointing to the VPS IP
- SSH access to the VPS
- A private GitHub repo containing your notes (markdown files)

---

## One-time VPS setup

### 1. Install Dokploy

SSH into the VPS and run:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

This installs Docker, Docker Swarm, Traefik, and Dokploy itself. When complete, the Dokploy UI is available at `http://your-vps-ip:3000`.

### 2. Create the data directories

```bash
mkdir -p /data/anchor/db /data/anchor/vault
```

### 3. Set up SSH access to the notes repo

The app runs `git pull` inside the container using the VPS host's SSH keys (mounted read-only at `/root/.ssh`). You need the VPS to have SSH access to your notes repo.

Generate a key on the VPS (skip if one already exists):

```bash
ssh-keygen -t ed25519 -C "anchor-vps" -f ~/.ssh/id_ed25519
```

Add the public key as a **deploy key** on the notes GitHub repo:

```bash
cat ~/.ssh/id_ed25519.pub
# Copy this output → GitHub notes repo → Settings → Deploy keys → Add deploy key
# Read access is sufficient (no write needed)
```

### 4. Clone the notes repo

```bash
git clone git@github.com:you/your-notes-repo.git /data/anchor/vault
```

Verify git pull works from the VPS:

```bash
git -C /data/anchor/vault pull
```

---

## Dokploy configuration

### 1. Initial Dokploy setup

1. Open `http://your-vps-ip:3000` in a browser
2. Create your admin account
3. (Recommended) Go to **Settings → Domain** and assign a domain to the Dokploy UI itself (e.g. `deploy.yourdomain.com`) so you can access it over HTTPS

### 2. Create the app

1. In the Dokploy UI, click **Create Project** → give it a name (e.g. `anchor`)
2. Inside the project, click **Create Service → Docker Compose**
3. Under **Source**, select **GitHub** and connect your GitHub account
4. Select this repository and the `main` branch
5. Set the **Compose Path** to `docker-compose.yml`

### 3. Set environment variables

In the service settings, go to **Environment** and add:

| Key | Value |
|-----|-------|
| `API_SECRET` | Your chosen API secret key |

`DB_DIRECTORY`, `OBSIDIAN_VAULT_PATH`, and `PORT` are already set in `docker-compose.yml` and do not need to be added here.

### 4. Configure the domain

1. Go to **Domains** in the service settings
2. Add your domain (e.g. `api.yourdomain.com`)
3. Traefik will automatically provision an SSL certificate via Let's Encrypt
4. Ensure your DNS A record for `api.yourdomain.com` points to the VPS IP

### 5. Deploy

Click **Deploy** to trigger the first deployment. Watch the logs to confirm:
- Docker image builds successfully
- Database migrations run on startup
- Server starts on port 3000

### 6. Enable auto-deploy

1. In the service settings, enable **Auto Deploy**
2. Copy the **Webhook URL** shown in the deployment logs
3. Go to this GitHub repo → **Settings → Webhooks → Add webhook**
   - Payload URL: the webhook URL from Dokploy
   - Content type: `application/json`
   - Event: **Just the push event**
4. Push a commit to `main` to verify the webhook triggers a redeploy

---

## Verifying the deployment

```bash
# Health check
curl https://api.yourdomain.com/health

# Trigger a vault sync (git pull + re-index notes)
curl -X POST https://api.yourdomain.com/api/sync \
  -H "Authorization: Bearer your-api-secret"

# Confirm SQLite DB exists on the VPS
ls /data/anchor/db/brain.db

# Confirm the notes repo is accessible
git -C /data/anchor/vault log --oneline -3
```

---

## How deploys work

1. You push to `main`
2. GitHub sends a webhook to Dokploy
3. Dokploy pulls the latest code and runs `docker compose up -d --build`
4. The container rebuilds and restarts with zero manual steps

---

## Vault sync

The app syncs the notes vault on demand via `POST /api/sync`. This runs `git pull` in `/data/anchor/vault` (the bind-mounted notes repo) then re-indexes changed markdown files into SQLite.

To keep the vault in sync automatically, set up a cron job on the VPS:

```bash
# Pull the vault every 15 minutes
*/15 * * * * git -C /data/anchor/vault pull >> /var/log/vault-sync.log 2>&1
```

Or call the `/api/sync` endpoint on a schedule from wherever your AI agents run.

---

## File locations on the VPS

| Path | Purpose |
|------|---------|
| `/data/anchor/db/brain.db` | SQLite database |
| `/data/anchor/vault/` | Notes git repo |
| `~/.ssh/id_ed25519` | SSH key for git pull auth |

---

## Troubleshooting

**Deployment fails at build step**
Check the Dokploy build logs. Most common cause: `bun.lock` out of sync with `package.json`. Run `bun install` locally and commit the updated lockfile.

**`git pull` fails inside container**
Verify the SSH key on the VPS has access to the notes repo:
```bash
ssh -T git@github.com  # should say "Hi username!"
git -C /data/anchor/vault pull
```

**Database errors on startup**
Migrations run automatically. If they fail, check that `/data/anchor/db/` exists and is writable on the VPS host.

**SSL certificate not provisioning**
Confirm the DNS A record for your domain points to the VPS IP and has propagated. Traefik retries cert provisioning automatically — check Traefik logs in the Dokploy UI.

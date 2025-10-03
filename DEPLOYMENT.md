# Deployment Guide

## Automated Deployment with GitHub Actions

This repository includes a GitHub Actions workflow that automatically deploys Archon to your DigitalOcean droplet whenever you push a version tag.

## Initial Setup

### 1. Prepare Your Droplet

SSH into your DigitalOcean droplet and set up the repository:

```bash
ssh root@your-droplet-ip

# Clone the repository
git clone https://github.com/davecrosser91/ResearchArchron.git
cd ResearchArchron

# Set up environment variables
cp python/.env.example python/.env
nano python/.env
# Add your SUPABASE_URL, SUPABASE_SERVICE_KEY, and other secrets
```

### 2. Generate SSH Key for GitHub Actions

On your **local machine**, generate a new SSH key pair:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key
```

This creates:
- `~/.ssh/github_deploy_key` (private key - for GitHub)
- `~/.ssh/github_deploy_key.pub` (public key - for droplet)

### 3. Add Public Key to Droplet

Copy the public key to your droplet:

```bash
# View the public key
cat ~/.ssh/github_deploy_key.pub

# Copy it, then SSH to droplet
ssh root@your-droplet-ip

# Add to authorized_keys
echo "your-public-key-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4. Add Secrets to GitHub Repository

Go to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

**DROPLET_IP**
- Name: `DROPLET_IP`
- Value: Your droplet IP address (e.g., `123.45.67.89`)

**SSH_PRIVATE_KEY**
- Name: `SSH_PRIVATE_KEY`
- Value: Content of `~/.ssh/github_deploy_key` (the private key)
  ```bash
  # Copy this output
  cat ~/.ssh/github_deploy_key
  ```

## How to Deploy

### Method 1: Push a Version Tag

```bash
# Make your changes and commit them
git add .
git commit -m "feat: add new feature"

# Create and push a version tag
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### Method 2: GitHub Web Interface

1. Go to your repository on GitHub
2. Click **Releases** → **Draft a new release**
3. Click **Choose a tag** → Type `v1.0.0` → **Create new tag**
4. Fill in release title and description
5. Click **Publish release**

### Tag Naming Convention

Use semantic versioning:
- `v1.0.0` - Major release
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)

## What Happens During Deployment

1. **GitHub Actions triggers** when you push a tag
2. **Connects to droplet** via SSH
3. **Pulls latest code** from the tagged version
4. **Stops services** (`docker compose down`)
5. **Rebuilds and restarts** (`docker compose up -d --build`)
6. **Cleans up** old Docker images
7. **Verifies** services are running
8. **Reports status** in GitHub Actions

## Monitoring Deployments

View deployment status:
1. Go to your GitHub repository
2. Click **Actions** tab
3. See deployment progress and logs

## Manual Deployment (Fallback)

If you need to deploy manually:

```bash
ssh root@your-droplet-ip
cd /root/ResearchArchron
git pull origin main
docker compose down
docker compose up -d --build
```

## Rollback to Previous Version

```bash
ssh root@your-droplet-ip
cd /root/ResearchArchron

# Check available tags
git tag

# Rollback to specific version
git checkout v1.0.0
docker compose down
docker compose up -d --build
```

## Troubleshooting

### Check deployment logs
```bash
ssh root@your-droplet-ip
cd /root/ResearchArchron
docker compose logs -f
```

### Check service status
```bash
docker compose ps
```

### Restart services
```bash
docker compose restart
```

### Full rebuild
```bash
docker compose down -v
docker compose up -d --build
```

## Environment Variables

Make sure your droplet has the `.env` file with:
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key  # if using OpenAI
# Add other required environment variables
```

## Security Notes

- ✅ SSH private key is stored securely in GitHub Secrets
- ✅ Only tagged releases trigger deployments
- ✅ `.env` file is never committed to Git
- ✅ Firewall configured to only allow necessary ports
- 🔒 Never share your SSH private key or GitHub secrets

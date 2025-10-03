# Simple Deployment Guide

## ✨ Fully Automated - No Manual Setup Required!

The GitHub Actions workflow does **everything** automatically:
- ✅ Clones the repository
- ✅ Creates the `.env` file with your secrets
- ✅ Builds and starts Docker containers
- ✅ Deploys updates on every tag push

## 🚀 Setup (One-Time Only)

### Step 1: Add SSH Key to Droplet

You need to add GitHub's SSH key to your droplet **once**. Use the DigitalOcean web console:

1. **Open DigitalOcean Console**:
   - Go to: https://cloud.digitalocean.com/droplets
   - Click your droplet → **Access** → **Launch Droplet Console**

2. **Generate and add SSH key**:

   On **your local machine**, generate a key:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy_key
   ```

   Copy the **public key**:
   ```bash
   cat ~/.ssh/github_deploy_key.pub
   ```

   In the **DigitalOcean console**, run:
   ```bash
   # Create SSH directory if it doesn't exist
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh

   # Add the public key (paste your key after the quote)
   echo "ssh-ed25519 AAAA...your-public-key-here" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

### Step 2: Add Secrets to GitHub

Go to: https://github.com/davecrosser91/ResearchArchron/settings/secrets/actions

Click **New repository secret** and add these **4 secrets**:

#### Secret 1: DROPLET_IP
- Name: `DROPLET_IP`
- Value: `159.89.3.207` (your droplet IP)

#### Secret 2: SSH_PRIVATE_KEY
- Name: `SSH_PRIVATE_KEY`
- Value: Copy from your local machine:
  ```bash
  cat ~/.ssh/github_deploy_key
  ```
  Copy **everything** including `-----BEGIN` and `-----END` lines

#### Secret 3: SUPABASE_URL
- Name: `SUPABASE_URL`
- Value: Your Supabase project URL (e.g., `https://xxx.supabase.co`)

#### Secret 4: SUPABASE_SERVICE_KEY
- Name: `SUPABASE_SERVICE_KEY`
- Value: Your Supabase service role key

#### Optional Secret 5: OPENAI_API_KEY (if using OpenAI)
- Name: `OPENAI_API_KEY`
- Value: Your OpenAI API key

---

## 🎯 Deploy Your App

### First Deployment

```bash
# Create and push a tag
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

**That's it!** GitHub Actions will:
1. Clone the repo to your droplet
2. Create `.env` with your secrets
3. Build and start all Docker containers
4. Report success/failure

### Watch Deployment

Go to: https://github.com/davecrosser91/ResearchArchron/actions

You'll see the deployment running in real-time!

---

## 🔄 Deploy Updates

Every time you want to deploy:

```bash
# Make changes and commit
git add .
git commit -m "feat: your changes"

# Create new version tag
git tag v1.0.1  # Increment version
git push origin main
git push origin v1.0.1
```

Or use GitHub web interface:
1. Go to **Releases** → **Draft a new release**
2. Create tag `v1.0.1`
3. Click **Publish release**

---

## 🔧 Manual Deployment (Alternative)

You can also manually trigger deployment from GitHub:

1. Go to: https://github.com/davecrosser91/ResearchArchron/actions
2. Click **Deploy to DigitalOcean** workflow
3. Click **Run workflow** → **Run workflow** button

---

## 📊 Access Your App

After deployment, your app will be available at:
- **Frontend**: `http://159.89.3.207:3737`
- **Backend API**: `http://159.89.3.207:8181/docs`

### Next Steps (Optional):
1. Set up a domain name
2. Configure Nginx reverse proxy
3. Get SSL certificate with Certbot
4. Configure firewall

---

## 🆘 Troubleshooting

### Check Deployment Logs
Go to: https://github.com/davecrosser91/ResearchArchron/actions
Click on the latest workflow run to see detailed logs

### Check Service Status
Use DigitalOcean console:
```bash
cd /root/ResearchArchron
docker compose ps
docker compose logs -f
```

### Restart Services
```bash
cd /root/ResearchArchron
docker compose restart
```

### Full Rebuild
```bash
cd /root/ResearchArchron
docker compose down
docker compose up -d --build
```

---

## 🔒 Security Checklist

- ✅ SSH private key stored securely in GitHub Secrets
- ✅ Environment variables never committed to Git
- ✅ Supabase credentials stored in GitHub Secrets
- ✅ Only tagged releases trigger deployments
- 🔲 Configure firewall (optional, but recommended)
- 🔲 Set up SSL/HTTPS (optional, but recommended)

---

## 🎉 That's It!

Your deployment is fully automated. Just push tags and let GitHub Actions handle everything!

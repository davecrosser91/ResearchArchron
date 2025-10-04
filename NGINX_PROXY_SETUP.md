# Nginx Reverse Proxy Setup for Archon

This guide will help you set up Nginx as a reverse proxy for Archon with subdomains:
- `app.rewire-ai.de` → Frontend (port 3737)
- `mcp.rewire-ai.de` → MCP Server (port 8051)
- API accessible through app subdomain at `/api`

## Prerequisites

- Domain pointing to your server IP (already done: rewire-ai.de → 159.89.3.207)
- SSH access to your DigitalOcean droplet
- Archon running via Docker Compose

## Step 1: Install Nginx

```bash
ssh root@159.89.3.207

# Update package list
apt update

# Install Nginx
apt install -y nginx

# Install Certbot for SSL certificates
apt install -y certbot python3-certbot-nginx
```

## Step 2: Configure DNS Records

In your domain provider (where you showed the screenshot), add these DNS records:

### CNAME Records to Add:

1. **For app subdomain:**
   - Type: `CNAME`
   - Name/Prefix: `app`
   - Value/Target: `rewire-ai.de` (or `@` depending on provider)
   - TTL: Automatic or 3600

2. **For mcp subdomain:**
   - Type: `CNAME`
   - Name/Prefix: `mcp`
   - Value/Target: `rewire-ai.de` (or `@`)
   - TTL: Automatic or 3600

**Alternative (A Records):**
If CNAME doesn't work, use A records instead:
- Type: `A`
- Name: `app`
- Value: `159.89.3.207`

- Type: `A`
- Name: `mcp`
- Value: `159.89.3.207`

## Step 3: Create Nginx Configuration

Create the Nginx configuration file:

```bash
nano /etc/nginx/sites-available/archon
```

Paste this configuration:

```nginx
# Frontend - app.rewire-ai.de
server {
    listen 80;
    listen [::]:80;
    server_name app.rewire-ai.de;

    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:8181/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Frontend application
    location / {
        proxy_pass http://localhost:3737;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# MCP Server - mcp.rewire-ai.de
server {
    listen 80;
    listen [::]:80;
    server_name mcp.rewire-ai.de;

    location / {
        proxy_pass http://localhost:8051;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # MCP needs longer timeouts for AI operations
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
}
```

## Step 4: Enable the Configuration

```bash
# Create symbolic link to enable the site
ln -s /etc/nginx/sites-available/archon /etc/nginx/sites-enabled/

# Remove default site if it exists
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx

# Enable Nginx to start on boot
systemctl enable nginx
```

## Step 5: Update Environment Variables

Update your `.env` file to use the production domain:

```bash
cd /root/ResearchArchron
nano .env
```

Add or update these lines:

```env
# Production domain configuration
ARCHON_HOST=mcp.rewire-ai.de
HOST=mcp.rewire-ai.de
VITE_ALLOWED_HOSTS=app.rewire-ai.de
```

Then restart services:

```bash
docker compose down
docker compose up -d
```

## Step 6: Set Up SSL Certificates (HTTPS)

Once DNS propagates (wait 5-10 minutes after adding DNS records), run:

```bash
# Get SSL certificates for both subdomains
certbot --nginx -d app.rewire-ai.de -d mcp.rewire-ai.de

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
certbot renew --dry-run
```

Certbot will automatically update your Nginx config to use HTTPS and redirect HTTP → HTTPS.

## Step 7: Configure Firewall

```bash
# Allow Nginx through firewall
ufw allow 'Nginx Full'

# Check status
ufw status
```

## Step 8: Test the Setup

After DNS propagates (5-30 minutes), test:

1. **Frontend**: https://app.rewire-ai.de
2. **MCP Server**: https://mcp.rewire-ai.de/health
3. **API**: https://app.rewire-ai.de/api/health

## Verification Commands

```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check Docker containers
docker compose ps

# Test DNS resolution
nslookup app.rewire-ai.de
nslookup mcp.rewire-ai.de
```

## Troubleshooting

### DNS Not Resolving
- Wait 5-30 minutes for DNS propagation
- Check with: `dig app.rewire-ai.de`
- Verify DNS records in your domain provider

### 502 Bad Gateway
- Check if Docker containers are running: `docker compose ps`
- Check container logs: `docker compose logs`
- Verify ports are not blocked: `netstat -tlnp | grep -E '3737|8051|8181'`

### SSL Certificate Fails
- Ensure DNS is fully propagated first
- Check if port 80 is accessible: `curl -I http://app.rewire-ai.de`
- Review certbot logs: `journalctl -u certbot`

### MCP Configuration Shows Wrong URL
- Ensure `ARCHON_HOST=mcp.rewire-ai.de` is in `.env`
- Restart services after updating: `docker compose restart`
- Clear browser cache

## Monitoring

```bash
# Watch Nginx access logs
tail -f /var/log/nginx/access.log

# Monitor SSL certificate expiry
certbot certificates
```

## Auto-Renewal

Certbot automatically renews certificates. The renewal service runs twice daily. Check:

```bash
systemctl status certbot.timer
```

---

## Summary

After completion, you'll have:
- ✅ https://app.rewire-ai.de - Frontend application
- ✅ https://mcp.rewire-ai.de - MCP server
- ✅ Automatic SSL renewal
- ✅ Proper reverse proxy configuration
- ✅ MCP configuration showing correct production URL

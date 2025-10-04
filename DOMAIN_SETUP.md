# Domain Setup Guide - Strato to DigitalOcean

## Overview

This guide will help you connect your Strato domain to the DigitalOcean droplet running Archon.

**Your Droplet IP**: `159.89.3.207`

## Step 1: Configure DNS in Strato

1. **Log into Strato Domain Management**
   - Go to https://www.strato.de
   - Navigate to your domain management panel
   - Find your domain and click on DNS settings

2. **Add A Records**
   - Add these two A records:

   | Type | Name/Host | Value/Points To | TTL |
   |------|-----------|-----------------|-----|
   | A | @ | 159.89.3.207 | 3600 |
   | A | www | 159.89.3.207 | 3600 |

   - `@` points your root domain (e.g., `example.com`) to the droplet
   - `www` points the www subdomain (e.g., `www.example.com`) to the droplet

3. **Wait for DNS Propagation**
   - DNS changes can take 15 minutes to 48 hours to propagate
   - Usually takes 1-2 hours with Strato
   - You can check status with: `dig yourdomain.com` or `nslookup yourdomain.com`

## Step 2: Configure Nginx on Droplet

SSH into your droplet and set up Nginx as a reverse proxy.

```bash
# SSH into droplet
ssh root@159.89.3.207

# Install Nginx
apt update
apt install nginx -y

# Create Nginx configuration
nano /etc/nginx/sites-available/archon
```

**Add this configuration** (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3737;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8181;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # MCP Server
    location /mcp {
        proxy_pass http://localhost:8051;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**Enable the configuration:**

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/archon /etc/nginx/sites-enabled/

# Remove default config
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Enable Nginx to start on boot
systemctl enable nginx
```

## Step 3: Configure Firewall

```bash
# Allow Nginx through firewall
ufw allow 'Nginx Full'

# Check status
ufw status
```

## Step 4: Install SSL Certificate (HTTPS)

Use Certbot to get a free SSL certificate from Let's Encrypt.

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: yes)
```

**Certbot will automatically:**
- Obtain the SSL certificate
- Update your Nginx configuration
- Set up automatic renewal

**Test auto-renewal:**

```bash
certbot renew --dry-run
```

## Step 5: Update Docker Compose (if needed)

If your frontend needs to know the public domain, update the environment variables in `docker-compose.yml`:

```yaml
services:
  archon-ui:
    environment:
      - VITE_API_URL=https://yourdomain.com/api
```

Then rebuild:

```bash
cd /root/ResearchArchron
docker compose down
docker compose up -d --build
```

## Verification Checklist

- [ ] DNS A records added in Strato
- [ ] DNS propagation complete (check with `dig yourdomain.com`)
- [ ] Nginx installed and configured
- [ ] Firewall allows Nginx
- [ ] SSL certificate installed
- [ ] HTTPS redirect working
- [ ] Application accessible at https://yourdomain.com

## Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# Should show: 159.89.3.207
```

### Nginx Errors
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test configuration
nginx -t
```

### SSL Certificate Issues
```bash
# Check Certbot logs
journalctl -u certbot

# Manually renew certificate
certbot renew --force-renewal
```

### Application Not Loading
```bash
# Check Docker containers are running
docker compose ps

# Check container logs
docker compose logs -f archon-ui
docker compose logs -f archon-server
```

## Quick Setup Script

Here's a script that automates most of the setup (run on droplet):

```bash
#!/bin/bash

# Replace with your actual domain
DOMAIN="yourdomain.com"

# Install Nginx
apt update && apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
cat > /etc/nginx/sites-available/archon << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3737;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8181;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /mcp {
        proxy_pass http://localhost:8051;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable config
ln -sf /etc/nginx/sites-available/archon /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Configure firewall
ufw allow 'Nginx Full'

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo "Nginx configured! Now run:"
echo "certbot --nginx -d $DOMAIN -d www.$DOMAIN"
```

## Next Steps After Domain Setup

1. Update any hardcoded URLs in your application
2. Configure CORS if needed
3. Set up monitoring (optional)
4. Configure backup strategy
5. Set up log rotation

## Support

If you encounter issues:
1. Check DNS propagation: https://www.whatsmydns.net/
2. Verify Nginx configuration: `nginx -t`
3. Check Docker containers: `docker compose ps`
4. Review logs: `docker compose logs` and `/var/log/nginx/error.log`

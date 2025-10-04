#!/bin/bash
# Nginx setup script for Archon with subdomains

set -e

echo "🚀 Setting up Nginx reverse proxy for Archon..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

# Install Nginx and Certbot
echo "📦 Installing Nginx and Certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# Create Nginx configuration
echo "📝 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/archon << 'EOF'
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
EOF

# Enable the site
echo "🔗 Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/archon /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx
systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 'Nginx Full' || echo "UFW not enabled, skipping..."

echo ""
echo "✅ Nginx setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add DNS records for app.rewire-ai.de and mcp.rewire-ai.de"
echo "2. Wait 5-30 minutes for DNS to propagate"
echo "3. Run: certbot --nginx -d app.rewire-ai.de -d mcp.rewire-ai.de"
echo "4. Test: https://app.rewire-ai.de"
echo ""
echo "📊 Check status:"
echo "  systemctl status nginx"
echo "  docker compose ps"
echo ""

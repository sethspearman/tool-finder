#!/bin/bash
set -e

# Resolve this machine's Tailscale HTTPS domain
DOMAIN=$(tailscale status --json | python3 -c "import sys,json; print(json.load(sys.stdin)['Self']['DNSName'].rstrip('.'))")
echo "Deploying to https://$DOMAIN"

# Provision/renew Tailscale TLS cert
mkdir -p /etc/ssl/tailscale
tailscale cert \
  --cert-file /etc/ssl/tailscale/cert.pem \
  --key-file  /etc/ssl/tailscale/key.pem \
  "$DOMAIN"

# Deploy API binary
mkdir -p /opt/tool-finder/api
rsync -a --delete /opt/tool-finder/incoming/api/ /opt/tool-finder/api/
chmod +x /opt/tool-finder/api/ToolFinder.Api

# Deploy frontend static files
mkdir -p /opt/tool-finder/ui
rsync -a --delete /opt/tool-finder/incoming/ui/ /opt/tool-finder/ui/

# Write nginx config from template
sed "s|__DOMAIN__|$DOMAIN|g" /opt/tool-finder/nginx.conf.template \
  > /etc/nginx/sites-available/tool-finder
ln -sf /etc/nginx/sites-available/tool-finder /etc/nginx/sites-enabled/tool-finder
rm -f /etc/nginx/sites-enabled/default

# Validate and reload nginx
nginx -t
systemctl reload nginx

# Install/reload systemd service for API
cp /opt/tool-finder/tool-finder-api.service /etc/systemd/system/tool-finder-api.service
systemctl daemon-reload
systemctl enable tool-finder-api
systemctl restart tool-finder-api

echo "Done — https://$DOMAIN"

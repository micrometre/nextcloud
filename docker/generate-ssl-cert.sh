#!/bin/bash

# Generate self-signed SSL certificate for local development
# This creates a certificate valid for 365 days

echo "Generating self-signed SSL certificate..."

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Generate private key and certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo "✓ SSL certificate generated successfully!"
echo "  Certificate: ssl/cert.pem"
echo "  Private key: ssl/key.pem"
echo ""
echo "Note: This is a self-signed certificate for development use."
echo "Your browser will show a security warning - this is expected."
echo ""
echo "To use with Nextcloud:"
echo "1. Run: docker-compose -f docker-compose-https.yml up -d"
echo "2. Access: https://localhost"
echo "3. Accept the browser security warning"

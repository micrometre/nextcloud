# HTTPS Setup for Nextcloud

## Option 1: Self-Signed Certificate (Development/Local Use)

Perfect for testing and local development.

### Steps:

1. **Generate SSL certificate:**
   ```bash
   chmod +x generate-ssl-cert.sh
   ./generate-ssl-cert.sh
   ```

2. **Stop current Nextcloud (if running):**
   ```bash
   docker-compose down
   ```

3. **Start with HTTPS:**
   ```bash
   docker-compose -f docker-compose-https.yml up -d
   ```

4. **Access Nextcloud:**
   - HTTPS: https://localhost
   - Your browser will show a security warning - click "Advanced" and "Proceed" (this is safe for local development)

### Note:
- Self-signed certificates will show browser warnings
- Perfect for local testing
- Not suitable for production

---

## Option 2: Let's Encrypt (Production - Real Domain)

For production use with a real domain name.

### Prerequisites:
- A domain name pointing to your server
- Ports 80 and 443 open on your firewall
- Server accessible from the internet

### Steps:

1. **Install Certbot:**
   ```bash
   sudo apt update
   sudo apt install certbot
   ```

2. **Get certificate (replace with your domain):**
   ```bash
   sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
   ```

3. **Copy certificates:**
   ```bash
   sudo mkdir -p ssl
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
   sudo chmod 644 ssl/cert.pem
   sudo chmod 600 ssl/key.pem
   ```

4. **Update nginx.conf:**
   - Change `server_name localhost;` to `server_name your-domain.com;`

5. **Start Nextcloud:**
   ```bash
   docker-compose -f docker-compose-https.yml up -d
   ```

6. **Set up auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

---

## Option 3: Traefik with Let's Encrypt (Automatic)

Easiest option for production with automatic certificate renewal.

See `docker-compose-traefik.yml` for configuration.

---

## Switching Between HTTP and HTTPS

### Switch to HTTPS:
```bash
docker-compose down
docker-compose -f docker-compose-https.yml up -d
```

### Switch back to HTTP:
```bash
docker-compose -f docker-compose-https.yml down
docker-compose up -d
```

---

## Troubleshooting

### Browser shows "Not Secure":
- Normal for self-signed certificates
- Click "Advanced" → "Proceed to localhost"

### "Cannot connect":
- Check if containers are running: `docker-compose ps`
- Check nginx logs: `docker logs nextcloud-nginx`

### Upload fails:
- Increase `client_max_body_size` in nginx.conf
- Restart: `docker-compose -f docker-compose-https.yml restart nginx`

### Certificate expired:
- Regenerate: `./generate-ssl-cert.sh`
- Restart: `docker-compose -f docker-compose-https.yml restart nginx`

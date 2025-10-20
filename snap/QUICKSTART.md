# Quick Start Guide - Nextcloud Deployment

Follow these steps to deploy Nextcloud on your Ubuntu 22.04 server.

## Step 1: Install Ansible Collections

```bash
make install-requirements
```

Or manually:

```bash
ansible-galaxy collection install -r requirements.yml
```

## Step 2: Configure Your Variables

Edit `inventory.yml` and update these values:

```yaml
nextcloud_admin_user: "admin"
nextcloud_admin_password: "YourSecurePassword123!"
```

### For Production with Let's Encrypt:

```yaml
nextcloud_domain: "cloud.yourdomain.com"
nextcloud_ssl_type: "letsencrypt"
nextcloud_letsencrypt_email: "your-email@example.com"
```

### For Testing with Self-Signed Certificate:

```yaml
nextcloud_ssl_type: "selfsigned"
```

## Step 3: Check Syntax (Optional)

```bash
make check-syntax
```

## Step 4: Deploy Nextcloud

```bash
make setup-deployment
```

Or run everything at once:

```bash
make setup-all
```

## Step 5: Access Your Nextcloud

Open your browser and navigate to:
- **Production:** `https://cloud.yourdomain.com`
- **Testing:** `https://your-server-ip`

Login with the credentials you configured in Step 2.

## Troubleshooting

### Installation fails with "MySQL server has gone away"
Wait 1-2 minutes for snap services to initialize, then run the playbook again.

### Can't access Nextcloud after installation
Check firewall: `sudo ufw status`
Check service: `sudo snap services nextcloud`

### Let's Encrypt fails
- Verify your domain points to your server
- Ensure ports 80 and 443 are open
- Check no other web server is using these ports

## Useful Commands

```bash
# Check Nextcloud status
sudo snap info nextcloud
sudo snap services nextcloud

# View logs
sudo snap logs nextcloud

# Restart Nextcloud
sudo snap restart nextcloud

# Add trusted domain
sudo nextcloud.occ config:system:set trusted_domains 2 --value=newdomain.com
```

## Next Steps

1. Enable two-factor authentication in Nextcloud settings
2. Install Nextcloud apps from the app store
3. Configure external storage (if needed)
4. Set up regular backups
5. Review security settings

For more details, see the main [README.md](README.md).

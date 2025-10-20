# Nextcloud Snap Ansible Deployment

This Ansible project automates the installation and configuration of Nextcloud on Ubuntu 22.04 using the snap package, based on the [DigitalOcean Nextcloud tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-nextcloud-on-ubuntu-22-04).

## Features

- ✅ Automated Nextcloud snap installation
- ✅ Admin account creation via command line
- ✅ Trusted domain configuration
- ✅ SSL/TLS setup with Let's Encrypt or self-signed certificates
- ✅ Firewall configuration (UFW)
- ✅ Idempotent playbook design

## Prerequisites

- Ubuntu 22.04 server
- Non-root user with sudo privileges
- Python 3 installed
- Ansible 2.9 or higher

### Required Ansible Collections

```bash
ansible-galaxy collection install community.general
```

## Quick Start

### 1. Clone or navigate to this repository

```bash
cd /home/ubuntu/repos/nextcloud/snap
```

### 2. Configure your variables

Edit the inventory file or create a vars file with your specific configuration:

```yaml
# Example: inventory/host_vars/local.yml
nextcloud_admin_user: "admin"
nextcloud_admin_password: "YourSecurePassword123!"
nextcloud_domain: "cloud.example.com"
nextcloud_ssl_type: "letsencrypt"
nextcloud_letsencrypt_email: "admin@example.com"
```

### 3. Run the playbook

```bash
# Check syntax first
make check-syntax

# Deploy Nextcloud
make setup-deployment
```

Or run directly with ansible-playbook:

```bash
ansible-playbook -i inventory.yml main.yml --tags setup_nextcloud
```

## Configuration Options

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `nextcloud_admin_user` | Nextcloud administrator username | `admin` |
| `nextcloud_admin_password` | Nextcloud administrator password | `SecurePass123!` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `nextcloud_domain` | undefined | Domain name for Nextcloud (required for Let's Encrypt) |
| `nextcloud_ip_address` | undefined | Server IP address to add to trusted domains |
| `nextcloud_ssl_type` | `selfsigned` | SSL type: `letsencrypt`, `selfsigned`, or `none` |
| `nextcloud_letsencrypt_email` | undefined | Email for Let's Encrypt (required if using Let's Encrypt) |
| `nextcloud_configure_firewall` | `true` | Whether to configure UFW firewall rules |

## SSL Configuration

### Option 1: Let's Encrypt (Recommended for production)

**Requirements:**
- A domain name pointing to your server
- Ports 80 and 443 accessible from the internet

```yaml
nextcloud_domain: "cloud.example.com"
nextcloud_ssl_type: "letsencrypt"
nextcloud_letsencrypt_email: "admin@example.com"
```

### Option 2: Self-Signed Certificate (Development/Testing)

```yaml
nextcloud_ssl_type: "selfsigned"
```

**Note:** Browsers will show a security warning with self-signed certificates.

### Option 3: No SSL (Not recommended)

```yaml
nextcloud_ssl_type: "none"
```

## Project Structure

```
.
├── ansible.cfg              # Ansible configuration
├── inventory.yml            # Inventory file
├── main.yml                 # Main playbook
├── Makefile                 # Shortcuts for common commands
├── README.md               # This file
└── roles/
    └── nextcloud/
        ├── defaults/
        │   └── main.yml    # Default variables
        ├── handlers/
        │   └── main.yml    # Handlers
        └── tasks/
            └── main.yml    # Main tasks
```

## Example Configurations

### Minimal Configuration (Self-Signed SSL)

```yaml
nextcloud_admin_user: "admin"
nextcloud_admin_password: "MySecurePassword123!"
nextcloud_ssl_type: "selfsigned"
```

### Production Configuration (Let's Encrypt)

```yaml
nextcloud_admin_user: "admin"
nextcloud_admin_password: "MySecurePassword123!"
nextcloud_domain: "cloud.example.com"
nextcloud_ip_address: "203.0.113.10"
nextcloud_ssl_type: "letsencrypt"
nextcloud_letsencrypt_email: "admin@example.com"
nextcloud_configure_firewall: true
```

## Usage

### Check Playbook Syntax

```bash
make check-syntax
```

### Deploy Nextcloud

```bash
make setup-deployment
```

### Access Nextcloud

After successful deployment, access your Nextcloud instance at:

- **With domain:** `https://cloud.example.com`
- **With IP only:** `https://your-server-ip`

Login with the admin credentials you configured.

## Post-Installation

### Verify Installation

```bash
sudo snap changes nextcloud
sudo snap info nextcloud
```

### View Nextcloud Logs

```bash
sudo snap logs nextcloud
```

### Manage Nextcloud

```bash
# Restart Nextcloud
sudo snap restart nextcloud

# Stop Nextcloud
sudo snap stop nextcloud

# Start Nextcloud
sudo snap start nextcloud
```

### Add More Trusted Domains

```bash
sudo nextcloud.occ config:system:set trusted_domains 3 --value=another-domain.com
```

## Troubleshooting

### Issue: Playbook fails with "MySQL server has gone away"

Wait a few minutes for the snap services to fully initialize, then run the playbook again.

### Issue: Let's Encrypt fails

Ensure:
1. Your domain points to your server's IP
2. Ports 80 and 443 are open and accessible
3. No other web server is using these ports

### Issue: Cannot access Nextcloud after installation

Check firewall rules:
```bash
sudo ufw status
```

Verify Nextcloud is running:
```bash
sudo snap services nextcloud
```

## Security Recommendations

1. **Use strong passwords** for the admin account
2. **Use Let's Encrypt** for production deployments
3. **Keep your system updated:**
   ```bash
   sudo snap refresh nextcloud
   sudo apt update && sudo apt upgrade
   ```
4. **Enable two-factor authentication** in Nextcloud settings
5. **Store sensitive variables securely** using Ansible Vault:
   ```bash
   ansible-vault encrypt_string 'YourPassword' --name 'nextcloud_admin_password'
   ```

## Additional Resources

- [Nextcloud Documentation](https://docs.nextcloud.com/)
- [Nextcloud Snap Documentation](https://github.com/nextcloud-snap/nextcloud-snap)
- [Original Tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-nextcloud-on-ubuntu-22-04)

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

# Quick Start: Sendmail + Fail2ban Email Alerts

## Setup in 3 Commands

```bash
# 1. Install and configure sendmail for local mail delivery
ansible-playbook main.yml -t setup_sendmail

# 2. Setup fail2ban with email notifications enabled
ansible-playbook main.yml -t setup_fail2ban -e "fail2ban_email_enabled=true"

# 3. Test email delivery
test-mail
```

## What's New

### Created: New Sendmail Role
- **Location**: `/roles/sendmail/`
- **Purpose**: Installs mailutils and configures local email delivery
- **Features**:
  - Auto-detects system user for mail delivery
  - Sets up mail forwarding for testing
  - Creates `test-mail` script for easy testing
  - Includes comprehensive README and troubleshooting

### Updated: Fail2ban Role
- **Email Support**: Now includes email notification variables
- **Automatic Setup**: Automatically includes sendmail role if emails enabled
- **Flexible Actions**: Choose between different email verbosity levels
- **Updated README**: Documents email notification setup

### Added: Integration Guide
- **Location**: `/docs/SENDMAIL_FAIL2BAN_INTEGRATION.md`
- **Coverage**: Complete setup, testing, troubleshooting, and advanced configurations

### Updated: Main Playbook
- New `setup_sendmail` tag for independent sendmail setup
- VM playbook now includes sendmail role

## Testing Email Notifications

### Send Test Email
```bash
# To current user
test-mail

# To specific user with subject and message
test-mail root "Fail2ban Alert" "This is a test alert"
```

### Read Received Mail
```bash
# Interactive mail reader
mail

# Check if new mail exists
mail -H

# Count unread messages
mail -e
```

### Monitor Email Delivery
```bash
# Watch mail log in real-time
sudo tail -f /var/log/mail.log

# Search for delivery issues
sudo grep -i error /var/log/mail.log
```

## Fail2ban Email Configuration

### Enable with Default Settings
```bash
ansible-playbook main.yml -t setup_fail2ban \
  -e "fail2ban_email_enabled=true"
```

### Customize Email Recipient
```bash
ansible-playbook main.yml -t setup_fail2ban \
  -e "fail2ban_email_enabled=true" \
  -e "fail2ban_email_recipient=admin@localhost"
```

### Different Email Detail Levels

```yaml
# Option 1: Minimal (Ban + Email only)
fail2ban_action: "%(action_m)s"

# Option 2: Moderate (Ban + Email + Whois)
fail2ban_action: "%(action_mw)s"

# Option 3: Detailed (Ban + Email + Whois + Log tail) - RECOMMENDED
fail2ban_action: "%(action_mwl)s"
```

## File Structure

```
roles/
├── sendmail/                  # NEW
│   ├── README.md             # Detailed sendmail documentation
│   ├── defaults/main.yml     # Configuration variables
│   ├── tasks/main.yml        # Installation and setup tasks
│   ├── handlers/main.yml     # Service restart handlers
│   └── meta/main.yml         # Role metadata
│
└── fail2ban/                  # UPDATED
    ├── README.md             # Updated with email docs
    ├── defaults/main.yml     # Added email variables
    ├── templates/
    │   ├── nextcloud.conf.j2
    │   └── nextcloud.local.j2  # Updated with email support
    └── tasks/main.yml         # Updated with sendmail integration

docs/
└── SENDMAIL_FAIL2BAN_INTEGRATION.md  # NEW - Complete integration guide
```

## Common Commands Reference

```bash
# Sendmail setup
ansible-playbook main.yml -t setup_sendmail

# Fail2ban with email
ansible-playbook main.yml -t setup_fail2ban -e "fail2ban_email_enabled=true"

# Both together for VM
ansible-playbook main.yml -t vm_setup_all -e "fail2ban_email_enabled=true"

# Test email
test-mail
test-mail root "Subject" "Message"

# Read mail
mail

# Check status
sudo fail2ban-client status nextcloud

# View logs
sudo tail -f /var/log/mail.log
sudo tail -f /var/log/fail2ban.log

# Restart services
sudo systemctl restart fail2ban
sudo systemctl restart postfix
```

## Next Steps

1. **Run sendmail role**: `ansible-playbook main.yml -t setup_sendmail`
2. **Test local mail**: `test-mail` then `mail`
3. **Configure fail2ban with emails**: `ansible-playbook main.yml -t setup_fail2ban -e "fail2ban_email_enabled=true"`
4. **Monitor**: `sudo tail -f /var/log/mail.log`

For detailed information, see:
- `roles/sendmail/README.md` - Sendmail role documentation
- `roles/fail2ban/README.md` - Fail2ban role documentation
- `docs/SENDMAIL_FAIL2BAN_INTEGRATION.md` - Complete integration guide

## Troubleshooting Quick Links

- **Mail not sending?** → See `docs/SENDMAIL_FAIL2BAN_INTEGRATION.md` → "Common Issues and Solutions"
- **Not receiving emails?** → Check `sudo tail -f /var/log/mail.log` for errors
- **Test mail command fails?** → Install `sudo apt install bsd-mailx`
- **Fail2ban not emailing?** → Run `sudo fail2ban-client -d` to verify config
- **More help?** → See roles/sendmail/README.md or roles/fail2ban/README.md

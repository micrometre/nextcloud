# Sendmail + Fail2ban Integration Guide

This guide explains how to use sendmail with fail2ban for email notifications on security events.

## Quick Start

### Step 1: Run the Sendmail Role

```bash
# Setup local email delivery for testing
ansible-playbook main.yml -t setup_sendmail
```

### Step 2: Run Fail2ban with Email Notifications

```bash
# Setup fail2ban with email notifications enabled
ansible-playbook main.yml -t setup_fail2ban -e "fail2ban_email_enabled=true"
```

### Step 3: Test Email Delivery

```bash
# Send a test email to verify configuration
test-mail

# Or send to specific user
test-mail root "Fail2ban Test" "This is a test email"
```

## Setup Options

### Option A: Localhost User Only (Recommended for Testing)

Perfect for local testing where emails go to your system user.

```bash
# Just run with defaults - emails go to current user
ansible-playbook main.yml -t setup_sendmail
ansible-playbook main.yml -t setup_fail2ban -e "fail2ban_email_enabled=true"
```

### Option B: Forward to Specific User

```bash
ansible-playbook main.yml -t setup_sendmail \
  -e "sendmail_local_user=ubuntu" \
  -e "sendmail_root_forward=ubuntu"

ansible-playbook main.yml -t setup_fail2ban \
  -e "fail2ban_email_enabled=true" \
  -e "fail2ban_email_recipient=ubuntu@localhost"
```

### Option C: Forward to Multiple Recipients (Advanced)

Edit `/etc/fail2ban/jail.d/nextcloud.local` after role execution:

```ini
[DEFAULT]
destemail = admin@localhost, ops@localhost
sendername = Fail2ban
action = %(action_mwl)s
```

Then restart fail2ban:

```bash
sudo systemctl restart fail2ban
```

## Playbook Examples

### Full Setup in One Command

```yaml
# Create: playbooks/setup-fail2ban-email.yml
- name: Setup Fail2ban with Email Notifications
  hosts: localhost
  roles:
    - sendmail
    - fail2ban
  vars:
    fail2ban_email_enabled: true
    fail2ban_email_recipient: "{{ ansible_user_id }}@localhost"
    fail2ban_maxretry: 3
```

Run with:
```bash
ansible-playbook playbooks/setup-fail2ban-email.yml
```

### Testing Different Email Actions

```yaml
# Different fail2ban actions to test:

# 1. Ban + Email + Whois + Log tail (RECOMMENDED)
fail2ban_action: "%(action_mwl)s"  # Most information

# 2. Ban + Email + Whois
fail2ban_action: "%(action_mw)s"   # Less verbose

# 3. Ban + Email only
fail2ban_action: "%(action_m)s"    # Minimal
```

## Testing and Troubleshooting

### Send Test Email

```bash
# Using the provided test-mail script
test-mail
test-mail root "Subject" "Message"

# Or manually with mail command
echo "This is a test" | mail -s "Test Email" root
```

### Read Received Mail

```bash
# Interactive mail reader
mail

# Or with mutt (if installed)
mutt

# Quick list of messages
mail -H
```

### Monitor Email Delivery in Real-time

```bash
# Watch mail log
sudo tail -f /var/log/mail.log

# Filter for specific events
sudo tail -f /var/log/mail.log | grep -i "to="

# Search for errors
sudo grep -i error /var/log/mail.log | tail -20
```

### Verify Fail2ban Configuration

```bash
# Check if email action is configured
sudo grep -A5 "DEFAULT" /etc/fail2ban/jail.d/nextcloud.local

# Verify jail status
sudo fail2ban-client status nextcloud

# Check fail2ban logs
sudo tail -50 /var/log/fail2ban.log

# Test regex against log file
sudo fail2ban-regex /var/snap/nextcloud/current/logs/nextcloud.log \
  /etc/fail2ban/filter.d/nextcloud.conf
```

### Trigger a Test Ban (Optional)

To test if fail2ban emails correctly when banning an IP:

```bash
# 1. Get current jail status
sudo fail2ban-client status nextcloud

# 2. Manually add a test IP
sudo fail2ban-client set nextcloud banip 192.0.2.1

# 3. Wait a moment, then check mail
mail

# 4. Remove the test IP
sudo fail2ban-client set nextcloud unbanip 192.0.2.1
```

## Common Issues and Solutions

### Issue: "command not found: mail"

**Solution:** Install bsd-mailx
```bash
sudo apt install bsd-mailx
```

### Issue: Email not being sent despite configuration

**Check the following:**

1. Sendmail/postfix service running:
   ```bash
   sudo systemctl status sendmail
   # or
   sudo systemctl status postfix
   ```

2. Mail log shows errors:
   ```bash
   sudo tail -30 /var/log/mail.log | grep -i error
   ```

3. User mailbox exists:
   ```bash
   sudo ls -la /var/mail/
   ```

4. Reinstall sendmail:
   ```bash
   sudo apt install --reinstall mailutils
   sudo systemctl restart postfix
   ```

### Issue: Emails in queue but not delivered

```bash
# Check postfix queue
sudo postqueue -p

# Delete stuck emails
sudo postsuper -d ALL

# Force re-delivery
sudo postfix flush
```

### Issue: Permission denied when reading mail

```bash
# Fix mail permissions
sudo chmod 1777 /var/mail
sudo chown -R root:root /var/mail

# Fix specific user's mail
sudo ls -la /var/mail/username
```

## Monitoring Alerts in Production

### Create Email Alert Log File

```bash
# Create a dedicated log for fail2ban alerts
sudo touch /var/log/fail2ban-alerts.log
sudo chown root:root /var/log/fail2ban-alerts.log
sudo chmod 0640 /var/log/fail2ban-alerts.log
```

### Archive Old Emails

```bash
# Create archive script: /usr/local/bin/archive-alerts.sh
#!/bin/bash
MAIL_DIR="/var/mail"
ARCHIVE_DIR="/var/log/mail-archives"

mkdir -p "$ARCHIVE_DIR"

for user in $(ls "$MAIL_DIR"); do
  if [ -f "$MAIL_DIR/$user" ]; then
    cp "$MAIL_DIR/$user" "$ARCHIVE_DIR/$user-$(date +%Y%m%d)"
    > "$MAIL_DIR/$user"  # Clear the file
  fi
done
```

### Setup Cron Job for Cleanup

```bash
# Add to root's crontab
0 0 * * 0 /usr/local/bin/archive-alerts.sh

# Edit:
sudo crontab -e

# Add:
0 0 * * 0 /usr/local/bin/archive-alerts.sh
```

## Integration with External Email Services

### Forward to Gmail

1. Create `/root/.forward`:
```
your-email@gmail.com
```

2. Update postfix to use Gmail relay:
```bash
sudo postconf -e 'relayhost = [smtp.gmail.com]:587'
sudo postconf -e 'smtp_sasl_auth_enable = yes'
sudo postconf -e 'smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd'
sudo postconf -e 'smtp_sasl_security_options = noanonymous'
sudo postconf -e 'smtp_tls_security_level = encrypt'
```

3. Create `/etc/postfix/sasl_passwd`:
```
[smtp.gmail.com]:587 your-email@gmail.com:app-password
```

4. Secure and apply:
```bash
sudo chmod 600 /etc/postfix/sasl_passwd
sudo postmap /etc/postfix/sasl_passwd
sudo systemctl restart postfix
```

### Using SendGrid Relay

```bash
# Update role variables
ansible-playbook main.yml -t setup_fail2ban \
  -e "fail2ban_email_enabled=true" \
  -e "sendmail_relay_host=smtp.sendgrid.net" \
  -e "sendmail_relay_port=587" \
  -e "sendmail_smtp_auth=true" \
  -e "sendmail_smtp_user=apikey" \
  -e "sendmail_smtp_password=SG.your_api_key"
```

## Best Practices

1. **Test Before Production**
   - Always test email delivery in development first
   - Verify emails actually arrive
   - Check formatting and information content

2. **Monitor Closely**
   - Monitor mail logs for delivery failures
   - Set up email forwarding to ensure alerts reach you
   - Archive old alerts regularly

3. **Security**
   - Don't store plaintext credentials in playbooks
   - Use Ansible vault for sensitive email credentials
   - Restrict mail spool permissions to appropriate users

4. **Performance**
   - Email actions can slow down fail2ban response
   - Consider queuing long-running actions
   - Limit email recipients for high-volume scenarios

## Additional Resources

- [Fail2ban Email Actions](https://www.fail2ban.org/wiki/index.php/Customizing_Fail2ban)
- [Ubuntu Postfix Configuration](https://help.ubuntu.com/community/Postfix)
- [Mail Command Reference](https://man7.org/linux/man-pages/man1/mail.1.html)

## Quick Reference

```bash
# Setup commands
ansible-playbook main.yml -t setup_sendmail
ansible-playbook main.yml -t setup_fail2ban -e "fail2ban_email_enabled=true"

# Testing
test-mail                                    # Send test email
mail                                         # Read mail
sudo tail -f /var/log/mail.log              # Monitor delivery
sudo tail -f /var/log/fail2ban.log          # Monitor fail2ban

# Configuration
sudo vi /etc/fail2ban/jail.d/nextcloud.local   # Edit jail config
sudo systemctl restart fail2ban             # Restart fail2ban
sudo fail2ban-client status nextcloud       # Check jail status

# Troubleshooting
sudo systemctl status postfix                # Check mail service
sudo postqueue -p                            # Check mail queue
sudo grep -i error /var/log/mail.log        # Find errors
```

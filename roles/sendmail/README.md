# Sendmail Role for Nextcloud

This Ansible role installs and configures sendmail/mailutils for local email delivery and testing. It's designed to work with fail2ban for sending email notifications.

## What It Does

- Installs mailutils (or postfix) for email delivery
- Configures local mail delivery to system users
- Sets up root mail forwarding for testing
- Creates a test mail script for easy testing
- Prepares the system for fail2ban email notifications

## Requirements

- Ubuntu 20.04+ or Debian 11+
- sudo/root access
- Basic understanding of email delivery

## Role Variables

All variables have sensible defaults defined in `defaults/main.yml`:

```yaml
# Enable/disable the role
sendmail_enabled: true

# Mail package to install (mailutils, postfix, exim4)
sendmail_package: mailutils

# Local system user for receiving test emails
sendmail_local_user: "{{ ansible_user_id }}"

# External relay host (empty for local-only delivery)
sendmail_relay_host: ""

# SMTP relay port
sendmail_relay_port: 25

# SMTP authentication
sendmail_smtp_auth: false
sendmail_smtp_user: ""
sendmail_smtp_password: ""

# Additional mail packages
sendmail_additional_packages:
  - bsd-mailx

# Forward root mail to a user (for testing)
sendmail_root_forward: "{{ sendmail_local_user }}"

# Mail spool and log settings
sendmail_create_mail_spool: true
sendmail_mail_log: "/var/log/mail.log"
```

## Example Playbook

### Basic Local Email Setup

```yaml
- hosts: localhost
  become: yes
  roles:
    - sendmail
```

### With Custom Local User

```yaml
- hosts: localhost
  become: yes
  roles:
    - role: sendmail
      vars:
        sendmail_local_user: "ubuntu"
        sendmail_root_forward: "ubuntu"
```

### With External SMTP Relay

```yaml
- hosts: localhost
  become: yes
  roles:
    - role: sendmail
      vars:
        sendmail_package: postfix
        sendmail_relay_host: "mail.example.com"
        sendmail_relay_port: 587
        sendmail_smtp_auth: true
        sendmail_smtp_user: "noreply@example.com"
        sendmail_smtp_password: "your-password-here"
```

## Post-Installation Usage

### Send a Test Email

```bash
# Send to current user
test-mail

# Send to specific user
test-mail root "Alert Subject" "Alert message"

# Send with just a subject
test-mail ubuntu "Test Alert"
```

### Check Received Mail

```bash
# Interactive mail client
mail

# Quick check for new mail
mail -H

# Show mail count
mail -e
```

### Monitor Mail Delivery

```bash
# Watch real-time mail log
sudo tail -f /var/log/mail.log

# Search for errors
sudo grep "error" /var/log/mail.log

# Check mail queue (if using postfix)
sudo postqueue -p
```

### Debug Mail Configuration

```bash
# Test mail connectivity
echo "Test message" | mail -v -s "Test" user@localhost

# Check aliases
cat /etc/aliases

# Verify local user mail directory
ls -la /var/mail/

# Check sendmail configuration
sudo sendmailconfig -v

# Test with telnet (if smtp port is open)
telnet localhost 25
```

## Integration with Fail2ban

Once sendmail is configured, update your fail2ban role to use email notifications:

```yaml
# In fail2ban role variables
fail2ban_email_enabled: true
fail2ban_email_recipient: "admin@localhost"
fail2ban_email_sender: "fail2ban@localhost"
fail2ban_action: "%(action_mwl)s"  # email with log lines
```

Then in fail2ban jail configuration:

```ini
[DEFAULT]
action = %(action_mwl)s

[jail]
# Actions will now include email notifications
action = %(action_mwl)s
```

## Troubleshooting

### Mail Command Not Found

```bash
# Install bsd-mailx or mutt
sudo apt install bsd-mailx
```

### Emails Not Being Delivered

1. Check mail service status:
   ```bash
   sudo systemctl status sendmail
   # or
   sudo systemctl status postfix
   ```

2. Check mail log:
   ```bash
   sudo tail -50 /var/log/mail.log
   ```

3. Verify user exists:
   ```bash
   id username
   ```

4. Check mail spool:
   ```bash
   sudo ls -la /var/mail/
   ```

### Mail Stuck in Queue

```bash
# For Postfix
sudo postqueue -p        # Show queue
sudo postsuper -d ALL    # Delete all mail in queue

# For Sendmail
sudo mailq               # Show queue
sudo sendmail -O QueueDirectory=/var/spool/mqueue -v -bi  # Rebuild
```

### Permission Issues

```bash
# Fix mail spool permissions
sudo chmod 1777 /var/mail

# Fix mail log permissions
sudo chmod 0640 /var/log/mail.log
sudo chown syslog:adm /var/log/mail.log

# Fix user home directory permissions
sudo chmod 755 ~username
```

### Test SMTP Connectivity

```bash
# Check if SMTP port is listening
sudo netstat -tlnp | grep 25

# Test with telnet
telnet localhost 25

# In telnet session, type:
# HELO localhost
# MAIL FROM: <test@localhost>
# RCPT TO: <user@localhost>
# DATA
# Subject: Test
# Test message
# .
# QUIT
```

## Mail Client Commands

### Using `mail` command

```bash
# Read mail
mail

# Commands in mail client:
# h     - Show message headers
# d 1   - Delete message 1
# r     - Reply to message
# q     - Quit
# x     - Exit without changes
```

### Alternative: Using `mutt`

```bash
# Install mutt
sudo apt install mutt

# Read mail with mutt
mutt

# Send email with mutt
echo "Message body" | mutt -s "Subject" user@localhost
```

## Security Considerations

1. **Local-only delivery**: By default, this role configures mail for local system users only
2. **No external relay**: Leave `sendmail_relay_host` empty for testing
3. **Log monitoring**: Check `/var/log/mail.log` for security issues
4. **Forward carefully**: Only forward mail to trusted users
5. **Test environment**: Perfect for development/testing before production use

## Additional Resources

- [Ubuntu Sendmail Docs](https://help.ubuntu.com/community/Sendmail)
- [Postfix Official Documentation](http://www.postfix.org/)
- [Fail2ban Documentation](https://www.fail2ban.org/wiki/index.php/Main_Page)
- [Mail Command Manual](https://man7.org/linux/man-pages/man1/mail.1.html)

## License

MIT

## Author

Ansible Developer

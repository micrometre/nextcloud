# Fail2ban Role for Nextcloud

This Ansible role configures fail2ban to protect your Nextcloud instance from brute force attacks by monitoring login failures and untrusted domain access attempts.

Based on the [Nextcloud Server Hardening Documentation](https://docs.nextcloud.com/server/23/admin_manual/installation/harden_server.html#setup-fail2ban).

## What It Does

- Installs and configures fail2ban
- Creates a custom filter for Nextcloud log patterns
- Sets up a jail to ban IPs after failed login attempts
- Monitors for:
  - Failed login attempts
  - Untrusted domain access attempts
- Auto-detects Nextcloud log location (snap or standard installation)

## Requirements

- Ubuntu 22.04 or Debian-based system
- Nextcloud installed and running
- Nextcloud logging enabled

## Role Variables

All variables have sensible defaults defined in `defaults/main.yml`:

```yaml
# Enable/disable Nextcloud jail
fail2ban_nextcloud_enabled: true

# Ports to protect
fail2ban_nextcloud_ports: "80,443"

# Maximum failed attempts before ban
fail2ban_maxretry: 3

# Ban duration in seconds (default: 24 hours)
fail2ban_bantime: 86400

# Time window to count failures (default: 12 hours)
fail2ban_findtime: 43200

# Nextcloud log file path (use "auto" for auto-detection)
fail2ban_nextcloud_logpath: "auto"

# Whitelisted IP addresses
fail2ban_ignoreip:
  - "127.0.0.1/8"
  - "::1"

# Email Notification Settings
fail2ban_email_enabled: false
fail2ban_email_recipient: "root@localhost"
fail2ban_email_sender: "fail2ban@localhost"
fail2ban_action: "iptables-multiport"
```

## Example Playbook

### Basic Usage

```yaml
- hosts: servers
  become: yes
  roles:
    - nextcloud
    - fail2ban
```

### Custom Configuration

```yaml
- hosts: servers
  become: yes
  roles:
    - role: fail2ban
      vars:
        fail2ban_maxretry: 5
        fail2ban_bantime: 172800  # 48 hours
        fail2ban_findtime: 86400   # 24 hours
        fail2ban_ignoreip:
          - "127.0.0.1/8"
          - "::1"
          - "192.168.1.0/24"  # Whitelist local network
```

## Configuration Examples

### Stricter Security (Production)

```yaml
fail2ban_maxretry: 3
fail2ban_bantime: 604800    # 7 days
fail2ban_findtime: 3600     # 1 hour
```

### More Lenient (Development)

```yaml
fail2ban_maxretry: 10
fail2ban_bantime: 3600      # 1 hour
fail2ban_findtime: 7200     # 2 hours
```

### Custom Log Path

If auto-detection fails, specify the log path manually:

```yaml
fail2ban_nextcloud_logpath: "/var/www/nextcloud/data/nextcloud.log"
```

### Email Notifications (Requires Sendmail Role)

Enable email alerts when IPs are banned:

```yaml
# Basic email notifications
- hosts: localhost
  roles:
    - sendmail
    - role: fail2ban
      vars:
        fail2ban_email_enabled: true
        fail2ban_email_recipient: "admin@localhost"

# With custom action (more detailed emails with whois info and log tail)
- hosts: localhost
  roles:
    - sendmail
    - role: fail2ban
      vars:
        fail2ban_email_enabled: true
        fail2ban_email_recipient: "alerts@localhost"
        fail2ban_action: "%(action_mwl)s"  # Ban + Email + Whois + Log tail
```

**Note:** Email notifications require the `sendmail` role to be run first. See the [Sendmail + Fail2ban Integration Guide](../../docs/SENDMAIL_FAIL2BAN_INTEGRATION.md) for complete setup instructions.

## Post-Installation Commands

### Check Jail Status

```bash
sudo fail2ban-client status nextcloud
```

### View Currently Banned IPs

```bash
sudo fail2ban-client get nextcloud banip
```

### Unban an IP Address

```bash
sudo fail2ban-client set nextcloud unbanip 192.168.1.100
```

### View Fail2ban Logs

```bash
sudo tail -f /var/log/fail2ban.log
```

### Test Filter Pattern

```bash
sudo fail2ban-regex /path/to/nextcloud.log /etc/fail2ban/filter.d/nextcloud.conf
```

## How It Works

1. **Filter** (`/etc/fail2ban/filter.d/nextcloud.conf`):
   - Defines regex patterns to detect failed login attempts
   - Monitors for "Login failed" messages in Nextcloud logs
   - Detects "Trusted domain error" messages

2. **Jail** (`/etc/fail2ban/jail.d/nextcloud.local`):
   - Applies the filter to the Nextcloud log file
   - Tracks failed attempts within the `findtime` window
   - Bans IPs exceeding `maxretry` attempts for `bantime` duration

3. **Action**:
   - Uses iptables to block banned IP addresses
   - Automatically unbans after the ban period expires

## Troubleshooting

### Jail Not Starting

Check if the log file exists:
```bash
sudo ls -la /var/snap/nextcloud/current/logs/nextcloud.log
```

Verify fail2ban configuration:
```bash
sudo fail2ban-client -d
```

### No Bans Recorded

Test the filter against your log file:
```bash
sudo fail2ban-regex /var/snap/nextcloud/current/logs/nextcloud.log /etc/fail2ban/filter.d/nextcloud.conf
```

### Restart Fail2ban

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client reload
```

## Security Considerations

1. **Whitelist trusted IPs** to avoid locking yourself out
2. **Monitor ban logs** regularly to detect attacks
3. **Adjust thresholds** based on your security needs
4. **Combine with other security measures**:
   - Use strong passwords
   - Enable 2FA in Nextcloud
   - Keep Nextcloud updated
   - Use HTTPS with valid certificates

## Dependencies

The `fail2ban` role has an optional dependency:
- **sendmail**: Only required if `fail2ban_email_enabled: true`

The fail2ban role will automatically include the sendmail role if email notifications are enabled.

## License

MIT

## References

- [Nextcloud Hardening Guide](https://docs.nextcloud.com/server/23/admin_manual/installation/harden_server.html)
- [Fail2ban Documentation](https://www.fail2ban.org/)

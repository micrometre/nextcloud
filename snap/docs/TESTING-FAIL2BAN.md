# Fail2ban Testing and Verification Guide

This guide helps you test and verify that fail2ban is correctly configured to protect your Nextcloud instance.

## Quick Verification

### 1. Check Fail2ban Service Status

```bash
sudo systemctl status fail2ban
```

**Expected output:**
```
● fail2ban.service - Fail2Ban Service
   Active: active (running)
```

### 2. Check Nextcloud Jail Status

```bash
sudo fail2ban-client status nextcloud
```

**Expected output:**
```
Status for the jail: nextcloud
|- Filter
|  |- Currently failed:  0
|  |- Total failed:      0
|  `- File list:         /var/snap/nextcloud/current/logs/nextcloud.log
`- Actions
   |- Currently banned:  0
   |- Total banned:      0
   `- Banned IP list:
```

## Test the Filter

### Test Against Current Log File

```bash
sudo fail2ban-regex /var/snap/nextcloud/current/logs/nextcloud.log \
  /etc/fail2ban/filter.d/nextcloud.conf
```

**What to look for:**
- `Failregex: X total` - Should show matched lines
- `Matched line(s):` - Should show lines containing "Login failed:"
- `Missed line(s):` - Regular log entries (expected)

### Test With Verbose Output

```bash
sudo fail2ban-regex --print-all-matched \
  /var/snap/nextcloud/current/logs/nextcloud.log \
  /etc/fail2ban/filter.d/nextcloud.conf
```

This shows exactly which lines matched the filter.

## Test Fail2ban Protection

### Option 1: Safe Test (Recommended)

Create a test log entry to verify detection:

```bash
# Create a test failed login entry
echo '{"reqId":"test","level":2,"time":"'$(date -u +%Y-%m-%dT%H:%M:%S+00:00)'","remoteAddr":"192.0.2.1","user":"--","app":"test","method":"POST","url":"/index.php/login","message":"Login failed: testuser (Remote IP: 192.0.2.1)","userAgent":"Test","version":"31.0.0.0","data":[]}' | sudo tee -a /var/snap/nextcloud/current/logs/nextcloud.log

# Wait a moment for fail2ban to process
sleep 2

# Check if the IP was detected (should increment failed count)
sudo fail2ban-client status nextcloud
```

### Option 2: Real Test (Use Caution)

**Warning:** This will temporarily ban your IP address!

1. Try to login to Nextcloud with wrong credentials 3 times
2. Check if your IP gets banned:
   ```bash
   sudo fail2ban-client status nextcloud
   ```

3. To unban yourself:
   ```bash
   sudo fail2ban-client set nextcloud unbanip YOUR.IP.ADDRESS
   ```

## Monitoring

### View Fail2ban Logs in Real-Time

```bash
sudo tail -f /var/log/fail2ban.log
```

Look for entries like:
```
2025-10-20 12:00:00,000 fail2ban.filter [123]: INFO [nextcloud] Found 192.0.2.1
2025-10-20 12:00:00,001 fail2ban.actions [123]: NOTICE [nextcloud] Ban 192.0.2.1
```

### View Nextcloud Log in Real-Time

```bash
sudo tail -f /var/snap/nextcloud/current/logs/nextcloud.log | grep -i "login"
```

### Check All Banned IPs

```bash
sudo fail2ban-client get nextcloud banip
```

### Check Current Failed Attempts

```bash
sudo fail2ban-client status nextcloud
```

## Common Test Scenarios

### Verify Ban Action

1. Check current iptables rules:
   ```bash
   sudo iptables -L f2b-nextcloud -n -v
   ```

2. After a ban, you should see the banned IP in the chain

### Verify Unban Action

1. Unban a test IP:
   ```bash
   sudo fail2ban-client set nextcloud unbanip 192.0.2.1
   ```

2. Verify it's removed:
   ```bash
   sudo fail2ban-client get nextcloud banip
   sudo iptables -L f2b-nextcloud -n -v
   ```

## Troubleshooting Tests

### Test 1: Filter Pattern

```bash
# Test the regex pattern directly
echo '{"reqId":"test","level":2,"time":"2025-10-20T12:00:00+00:00","remoteAddr":"192.0.2.1","user":"--","app":"test","method":"POST","url":"/login","message":"Login failed: test","userAgent":"Test","version":"31.0.0.0"}' | \
  sudo fail2ban-regex --print-all-matched - /etc/fail2ban/filter.d/nextcloud.conf
```

**Expected:** Should match 1 line

### Test 2: Date Pattern

```bash
# Verify date parsing works
sudo fail2ban-regex --datepattern '{^LN-BEG}' \
  /var/snap/nextcloud/current/logs/nextcloud.log \
  /etc/fail2ban/filter.d/nextcloud.conf
```

### Test 3: File Permissions

```bash
# Verify fail2ban can read the log file
sudo -u root test -r /var/snap/nextcloud/current/logs/nextcloud.log && echo "OK" || echo "FAIL"
```

## Expected Results

✅ **Working correctly:**
- Service is active and running
- Jail shows the correct log file path
- Filter matches "Login failed:" messages
- Failed login attempts increment the counter
- IPs get banned after maxretry attempts
- Bans expire after bantime
- Unban command works

❌ **Issues to investigate:**
- Service not running
- Jail not found
- Log file not found
- No matches in filter test
- Bans not happening despite failures
- IPs not being unbanned

## Performance Check

### Check Fail2ban Resource Usage

```bash
ps aux | grep fail2ban
```

### Check Number of Banned IPs

```bash
sudo fail2ban-client status nextcloud | grep "Total banned"
```

## Security Verification

### Check Whitelist

```bash
cat /etc/fail2ban/jail.d/nextcloud.local | grep ignoreip
```

Ensure your trusted IPs are listed.

### Verify Ban Duration

```bash
cat /etc/fail2ban/jail.d/nextcloud.local | grep -E "(bantime|findtime|maxretry)"
```

**Recommended settings:**
- `bantime = 86400` (24 hours)
- `findtime = 43200` (12 hours)  
- `maxretry = 3` (3 failed attempts)

## Automated Testing Script

Save this as `test-fail2ban.sh`:

```bash
#!/bin/bash
echo "=== Fail2ban Nextcloud Protection Test ==="
echo ""

echo "1. Service Status:"
sudo systemctl is-active fail2ban

echo ""
echo "2. Jail Status:"
sudo fail2ban-client status nextcloud | grep -E "(Filter|Currently|Total|banned)"

echo ""
echo "3. Filter Test:"
sudo fail2ban-regex /var/snap/nextcloud/current/logs/nextcloud.log \
  /etc/fail2ban/filter.d/nextcloud.conf | grep -E "(Failregex|matched|missed)"

echo ""
echo "4. Configuration:"
echo "   Log path: $(grep logpath /etc/fail2ban/jail.d/nextcloud.local | awk '{print $3}')"
echo "   Max retry: $(grep maxretry /etc/fail2ban/jail.d/nextcloud.local | awk '{print $3}')"
echo "   Ban time: $(grep bantime /etc/fail2ban/jail.d/nextcloud.local | awk '{print $3}') seconds"

echo ""
echo "✅ Test complete!"
```

Make it executable and run:
```bash
chmod +x test-fail2ban.sh
./test-fail2ban.sh
```

## References

- [Fail2ban Documentation](https://www.fail2ban.org/)
- [Nextcloud Hardening Guide](https://docs.nextcloud.com/server/23/admin_manual/installation/harden_server.html#setup-fail2ban)

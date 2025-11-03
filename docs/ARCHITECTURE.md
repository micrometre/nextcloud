```
SENDMAIL + FAIL2BAN ARCHITECTURE
═══════════════════════════════════════════════════════════════

1. SYSTEM LAYERS
────────────────────────────────────────────────────────────

    ┌─────────────────────────────────────┐
    │     NEXTCLOUD APPLICATION           │
    │  (Logs suspicious activity)         │
    └────────────┬────────────────────────┘
                 │
                 │ (JSON logs with IP addresses)
                 ↓
    ┌─────────────────────────────────────┐
    │   FAIL2BAN SERVICE                  │
    │  • Monitors Nextcloud logs          │
    │  • Detects failed login patterns    │
    │  • Bans attacking IPs               │
    │  • SENDS EMAIL ALERTS               │
    └────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────────────────┐
    │         (triggers email)            │
    ↓                                      ↓
┌───────────────────┐         ┌──────────────────────┐
│  SENDMAIL/POSTFIX │         │  IPTABLES FIREWALL   │
│  • Local delivery │         │  • Blocks IP         │
│  • Mail forwarding│         │  • Unblocks after    │
│  • Mail queue     │         │    ban time          │
└────────┬──────────┘         └──────────────────────┘
         │
    ┌────┴─────────────────────────┐
    │  EMAIL DELIVERY              │
    ├──────────────────────────────┤
    │  ✓ To: admin@localhost       │
    │  ✓ From: fail2ban@localhost  │
    │  ✓ Subject: IP Banned        │
    │  ✓ Body: Details + Log tail  │
    └────────┬─────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │  SYSTEM MAILBOX              │
    │  /var/mail/[username]        │
    │  (readable with 'mail' cmd)  │
    └──────────────────────────────┘


2. ROLE DEPENDENCY CHAIN
────────────────────────────────────────────────────────────

    main.yml playbook
         │
         ├─ nextcloud role ───────► Nextcloud installed
         │
         ├─ sendmail role ────────► Mail system ready
         │     ├─ defaults/main.yml (variables)
         │     ├─ tasks/main.yml (install mailutils)
         │     ├─ Create test-mail script
         │     └─ Configure mail forwarding
         │
         └─ fail2ban role ────────► IP blocking + emails
               ├─ Include sendmail (if email enabled)
               ├─ defaults/main.yml (email variables)
               ├─ tasks/main.yml (setup jails)
               └─ templates/nextcloud.local.j2 (email actions)


3. DATA FLOW
────────────────────────────────────────────────────────────

    [Failed Login in Nextcloud Log]
              ↓
    [Fail2ban Filter Detects Pattern]
              ↓
    [Match Count Exceeds Threshold (3 by default)]
              ↓
    [Trigger Ban Action: iptables]
              ↓
    [Simultaneously: Trigger Email Action]
              ↓
    ┌──────────────────────────────────────┐
    │ Email Action (%(action_mwl)s)        │
    │ ├─ Ban the IP                        │
    │ ├─ Send email with:                  │
    │ │  • Banned IP details               │
    │ │  • Whois lookup info               │
    │ │  • Last 10 log lines               │
    │ └─ Track action in fail2ban log      │
    └──────────┬───────────────────────────┘
               ↓
    [Mail System (Postfix)]
               ↓
    [Local Delivery to /var/mail/user]
               ↓
    [Read with: mail command]


4. CONFIGURATION VARIABLES HIERARCHY
────────────────────────────────────────────────────────────

    SENDMAIL Variables:
    ├─ sendmail_enabled: true
    ├─ sendmail_package: mailutils
    ├─ sendmail_local_user: current_user
    ├─ sendmail_root_forward: current_user
    └─ sendmail_additional_packages: [bsd-mailx]

    FAIL2BAN Variables:
    ├─ fail2ban_nextcloud_enabled: true
    ├─ fail2ban_maxretry: 3
    ├─ fail2ban_bantime: 86400 (24 hours)
    ├─ fail2ban_findtime: 43200 (12 hours)
    ├─ fail2ban_email_enabled: false (toggle this!)
    ├─ fail2ban_email_recipient: root@localhost
    ├─ fail2ban_email_sender: fail2ban@localhost
    └─ fail2ban_action: iptables-multiport (or %(action_mwl)s for email)


5. FILE STRUCTURE CREATED
────────────────────────────────────────────────────────────

    roles/sendmail/                          ← NEW ROLE
    ├── README.md                            (300+ lines, comprehensive)
    ├── defaults/main.yml                    (14 variables)
    ├── tasks/main.yml                       (Setup + test-mail script)
    ├── handlers/main.yml                    (Service restart handlers)
    ├── meta/main.yml                        (Role metadata)
    └── templates/                           (empty - templates via copy)

    roles/fail2ban/                          ← UPDATED
    ├── README.md                            (+ email notification section)
    ├── defaults/main.yml                    (+ 4 email variables)
    ├── tasks/main.yml                       (+ sendmail inclusion)
    ├── templates/
    │   └── nextcloud.local.j2               (+ email action support)
    └── ...

    docs/                                    ← NEW DOCUMENTATION
    ├── SENDMAIL_QUICKSTART.md               (Quick 3-step setup)
    ├── SENDMAIL_FAIL2BAN_INTEGRATION.md     (Complete 500+ line guide)
    └── ...

    main.yml                                 ← UPDATED
    └── Added setup_sendmail tag
    └── Added sendmail to VM playbook


6. TESTING & MONITORING WORKFLOW
────────────────────────────────────────────────────────────

    Step 1: Install Sendmail
    ─────────────────────────
    $ ansible-playbook main.yml -t setup_sendmail
    ↓
    Output: "✓ Sendmail configured successfully"

    Step 2: Test Email
    ──────────────────
    $ test-mail
    ↓
    Output: "✓ Email sent successfully to user"

    Step 3: Read Email
    ──────────────────
    $ mail
    ↓
    (Interactive mail reader opens)

    Step 4: Enable Fail2ban Emails
    ──────────────────────────────
    $ ansible-playbook main.yml -t setup_fail2ban \
      -e "fail2ban_email_enabled=true"
    ↓
    Output: "Email notifications: ENABLED - Recipient: user@localhost"

    Step 5: Monitor Real-time
    ─────────────────────────
    $ sudo tail -f /var/log/mail.log
    $ sudo tail -f /var/log/fail2ban.log


7. SECURITY BOUNDARIES
────────────────────────────────────────────────────────────

    ✓ Local-only delivery (default, safe for testing)
    ✓ No external email relay configured (unless specified)
    ✓ Mail spool permissions: 1777 (world writable, safe)
    ✓ Mail file permissions: 0640 (readable by user only)
    ✓ Sendmail runs as unprivileged user
    ✓ No credentials stored in playbooks
    ✓ Email content includes only action details, no secrets


8. COMMAND QUICK REFERENCE
────────────────────────────────────────────────────────────

    Setup Commands:
    ├─ ansible-playbook main.yml -t setup_sendmail
    ├─ ansible-playbook main.yml -t setup_fail2ban -e "fail2ban_email_enabled=true"
    └─ ansible-playbook main.yml -t vm_setup_all -e "fail2ban_email_enabled=true"

    Test Commands:
    ├─ test-mail                           (send test email)
    ├─ test-mail root "subj" "msg"        (send with details)
    └─ mail                                (read emails)

    Monitoring Commands:
    ├─ sudo tail -f /var/log/mail.log     (mail delivery)
    ├─ sudo tail -f /var/log/fail2ban.log (fail2ban events)
    ├─ sudo fail2ban-client status nextcloud
    └─ sudo fail2ban-client get nextcloud banip

    Troubleshooting Commands:
    ├─ sudo systemctl status postfix       (mail service)
    ├─ sudo systemctl status fail2ban      (fail2ban service)
    ├─ sudo postqueue -p                   (mail queue)
    └─ sudo grep error /var/log/mail.log   (find issues)
```

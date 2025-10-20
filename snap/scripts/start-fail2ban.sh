#!/bin/bash
# Script to start fail2ban after Nextcloud installation
# Run this after Nextcloud is fully installed and the log file exists

set -e

echo "Checking for Nextcloud log file..."

LOG_FILE="/var/snap/nextcloud/current/logs/nextcloud.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "ERROR: Nextcloud log file not found at: $LOG_FILE"
    echo ""
    echo "Please ensure:"
    echo "  1. Nextcloud is installed"
    echo "  2. You've accessed Nextcloud at least once"
    echo "  3. Logging is enabled in Nextcloud"
    echo ""
    exit 1
fi

echo "✓ Nextcloud log file found"
echo "Starting fail2ban service..."

sudo systemctl start fail2ban

echo "Waiting for fail2ban to initialize..."
sleep 3

echo "Checking Nextcloud jail status..."
sudo fail2ban-client status nextcloud

echo ""
echo "✓ Fail2ban is now protecting your Nextcloud instance!"
echo ""
echo "Useful commands:"
echo "  sudo fail2ban-client status nextcloud         - Check jail status"
echo "  sudo fail2ban-client get nextcloud banip      - View banned IPs"
echo "  sudo fail2ban-client set nextcloud unbanip IP - Unban an IP"

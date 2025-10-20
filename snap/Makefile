# Install required Ansible collections
install-requirements:
	ansible-galaxy collection install -r requirements.yml

# Check playbook syntax
check-syntax:
	ansible-playbook --syntax-check main.yml

# Deploy Nextcloud
setup-deployment:
	ansible-playbook -i inventory.yml main.yml --tags setup_nextcloud

# Deploy fail2ban for Nextcloud
setup-fail2ban:
	ansible-playbook -i inventory.yml main.yml --tags setup_fail2ban

# Full setup (install requirements + deploy Nextcloud + fail2ban)
setup-all: install-requirements setup-deployment setup-fail2ban

.PHONY: install-requirements check-syntax setup-deployment setup-fail2ban setup-all

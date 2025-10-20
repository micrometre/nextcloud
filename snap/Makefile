# Install required Ansible collections
install-requirements:
	ansible-galaxy collection install -r requirements.yml

# Check playbook syntax
check-syntax:
	ansible-playbook --syntax-check main.yml

# Deploy Nextcloud
setup-deployment:
	ansible-playbook -i inventory.yml main.yml --tags setup_nextcloud

# Full setup (install requirements + deploy)
setup-all: install-requirements setup-deployment

.PHONY: install-requirements check-syntax setup-deployment setup-all

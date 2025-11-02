.PHONY: help setup install_virtualization create_vm status clean clean_all vm_status workspace

# Default target
help:
	@echo "VM Management with Ansible"
	@echo "=========================="
	@echo ""
	@echo "Available targets:"
	@echo "  setup             - Install virtualization and create VM (full setup)"
	@echo "  install_virtualization - Install QEMU/KVM and libvirt only"
	@echo "  create_vm         - Create VM only (requires virtualization setup)"
	@echo "  vm_status         - Show VM status and connection info"
	@echo "  workspace         - Show workspace overview and disk usage"
	@echo "  clean             - Stop and remove VM"
	@echo "  clean_all         - Clean VM and work files"
	@echo "  help              - Show this help message"
	@echo ""
	@echo "Configuration:"
	@echo "  Edit group_vars/all.yml or host_vars/localhost.yml to customize VM settings"
	@echo ""

setup: install_virtualization create_vm

install_virtualization:
	@echo "Installing virtualization components..."
	ansible-playbook -i inventory/inventory.yml main.yml --tags setup_virtualization

create_vm:
	@echo "Creating VM..."
	ansible-playbook -i inventory/inventory.yml main.yml --tags create_vm

vm_status:
	@echo "Checking VM status..."
	ansible-playbook -i inventory/inventory.yml -e "vm_action=status" main.yml --tags create_vm

workspace:
	@echo "VM Workspace Overview:"
	@if [ -d "$(HOME)/vm-workspace" ]; then \
		echo "Total usage: $$(du -sh $(HOME)/vm-workspace | cut -f1)"; \
		echo ""; \
		echo "VM directories:"; \
		ls -la $(HOME)/vm-workspace/; \
		echo ""; \
		echo "Structure:"; \
		if command -v tree >/dev/null 2>&1; then \
			tree $(HOME)/vm-workspace -h; \
		else \
			find $(HOME)/vm-workspace -type f -exec ls -lh {} \;; \
		fi; \
	else \
		echo "No workspace found at $(HOME)/vm-workspace"; \
	fi

clean:
	@echo "Cleaning up VM..."
	ansible-playbook -i inventory/inventory.yml -e "vm_cleanup=true" main.yml --tags create_vm

clean_all: clean
	@echo "Cleaning all files..."
	@rm -rf /tmp/vm-manager
	@echo "Cleanup complete!"

# Legacy compatibility targets
check: vm_status
status: vm_status
create_vm_local: create_vm
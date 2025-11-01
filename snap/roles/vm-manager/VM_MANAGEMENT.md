# Virtualization and VM Management

This project has been refactored to separate virtualization setup from VM management into two distinct Ansible roles:

## Roles

### 1. Virtualization Role
Located in `roles/virtualization/`

**Purpose**: Install and configure QEMU/KVM and libvirt infrastructure

**Features**:
- Installs QEMU/KVM packages
- Configures libvirt daemon
- Sets up default network
- Adds user to libvirt group
- Verifies virtualization support

### 2. VM Manager Role
Located in `roles/vm-manager/`

**Purpose**: Create and manage virtual machines using cloud-init

**Features**:
- Downloads Ubuntu cloud images
- Creates VM disk images
- Generates cloud-init configurations
- Creates and manages VMs
- Provides VM status and cleanup

## Quick Start

### 1. Install Virtualization Infrastructure
```bash
make install_virtualization
```
or
```bash
ansible-playbook -i inventory/inventory.yml main.yml --tags setup_virtualization
```

### 2. Create a VM
```bash
make create_vm
```
or
```bash
ansible-playbook -i inventory/inventory.yml main.yml --tags create_vm
```

### 3. Complete Setup (Both Steps)
```bash
make setup
```

## VM Workspace Organization

Each VM is organized in its own dedicated workspace:

```
~/vm-workspace/
├── hal9000/                    # VM-specific folder
│   ├── focal-server-cloudimg-amd64.img    # Ubuntu cloud image
│   ├── hal9000.img            # VM disk image (backing file)
│   ├── user-data              # Cloud-init user configuration
│   ├── meta-data              # Cloud-init metadata
│   └── cidata.iso             # Cloud-init ISO
├── my-other-vm/               # Another VM's workspace
│   └── ...
└── shared/                    # Shared resources (future use)
```

### Workspace Benefits
- **Organized**: Each VM has its own folder
- **Portable**: Easy to backup or move VM files
- **Clean**: No mixing of different VM configurations
- **Reusable**: Base images can be shared between VMs

## Configuration

### VM Configuration
Edit `host_vars/localhost.yml` to customize VM settings:

```yaml
# VM Configuration
vm_name: my-vm
vm_hostname: my-vm
vm_ram: 4096
vm_vcpus: 2
vm_disk_size: 20G
ubuntu_version: jammy

# Workspace Configuration
work_directory: "{{ ansible_env.HOME }}/vm-workspace"  # Main workspace
vm_workspace_dir: "{{ work_directory }}/{{ vm_name }}" # VM-specific folder

# SSH Configuration  
ssh_public_key_file: "{{ ansible_env.HOME }}/.ssh/id_ed25519.pub"
generate_ssh_key: true

# Management
force_recreate: true
```

### Global Configuration
Edit `group_vars/all.yml` for environment-wide settings.

## Available Commands

### Using Make
```bash
make help                    # Show available commands
make setup                   # Full setup (virtualization + VM)
make install_virtualization  # Install QEMU/KVM/libvirt only
make create_vm               # Create VM only
make vm_status               # Show VM status
make clean                   # Remove VM
make clean_all               # Remove VM and temp files
```

### Using Ansible Directly
```bash
# Install virtualization
ansible-playbook -i inventory/inventory.yml main.yml --tags setup_virtualization

# Create VM
ansible-playbook -i inventory/inventory.yml main.yml --tags create_vm

# Check VM status
ansible-playbook -i inventory/inventory.yml main.yml --tags create_vm -e "vm_action=status"

# Clean up VM
ansible-playbook -i inventory/inventory.yml main.yml --tags create_vm -e "vm_cleanup=true"

# Force recreate VM
ansible-playbook -i inventory/inventory.yml main.yml --tags create_vm -e "force_recreate=true"
```

## VM Access

Once the VM is created, you can access it via:

1. **SSH** (preferred):
   ```bash
   # Get VM IP address
   virsh domifaddr hal9000
   
   # SSH to VM
   ssh ubuntu@<vm-ip>
   ```

2. **VNC**:
   ```bash
   # Get VNC display
   virsh vncdisplay hal9000
   
   # Connect with VNC client to localhost:display
   ```

3. **Console**:
   ```bash
   virsh console hal9000
   ```

## VM Management

### Check VM Status
```bash
virsh list --all
virsh domstate hal9000
```

### Start/Stop VM
```bash
virsh start hal9000
virsh shutdown hal9000
virsh destroy hal9000  # Force stop
```

### Remove VM
```bash
virsh undefine hal9000 --remove-all-storage
```

## SSH Key Setup

The system will automatically:
1. Look for existing SSH keys (`~/.ssh/id_rsa.pub`, `~/.ssh/id_ed25519.pub`)
2. Generate a new key if `generate_ssh_key: true` and none exists
3. Add the public key to the VM's authorized_keys

## Troubleshooting

### Permission Issues
```bash
# Add user to libvirt group (requires logout/login)
sudo usermod -a -G libvirt $USER

# Or use newgrp to activate group membership
newgrp libvirt
```

### Network Issues
```bash
# Check libvirt network
virsh net-list
virsh net-start default

# Check VM network
virsh domifaddr hal9000
```

### Storage Issues
```bash
# Check libvirt storage
virsh pool-list
virsh vol-list default
```

## Migration from Original cloud-init Role

The original `roles/cloud-init` role has been split into:
- `roles/virtualization` - System setup
- `roles/vm-manager` - VM creation and management

The main benefits:
- **Separation of concerns**: Infrastructure vs VM management
- **Reusability**: Virtualization role can be used independently
- **Better organization**: Cleaner role structure
- **Maintainability**: Easier to update and extend

### Legacy Compatibility

The new Makefile in `roles/vm-manager/` provides compatibility with the original commands:
- `make check` → `make vm_status`
- `make status` → `make vm_status`
- `make create_vm_local` → `make create_vm`

## File Structure

```
roles/
├── virtualization/          # QEMU/KVM/libvirt setup
│   ├── defaults/main.yml    # Default variables
│   ├── tasks/main.yml       # Main installation tasks
│   ├── handlers/main.yml    # Service handlers
│   ├── templates/           # Network configuration templates
│   └── README.md
└── vm-manager/              # VM creation and management
    ├── defaults/main.yml    # VM configuration defaults
    ├── tasks/
    │   ├── main.yml         # Main VM creation tasks
    │   ├── cleanup.yml      # VM cleanup tasks
    │   └── status.yml       # VM status tasks
    ├── templates/           # Cloud-init templates
    ├── files/               # Static files
    ├── Makefile            # Convenience commands
    └── README.md
```
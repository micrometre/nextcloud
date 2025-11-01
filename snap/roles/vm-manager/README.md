# VM Manager Role

This role manages virtual machine creation and cloud-init configuration for libvirt/KVM.

## Features

- Downloads Ubuntu cloud images
- Creates VM disk images
- Generates cloud-init ISOs
- Creates and manages VMs
- Configures cloud-init user data and metadata

## Requirements

- virtualization role must be run first
- libvirt/KVM properly configured
- SSH keys configured for VM access

## Variables

### VM Configuration
```yaml
vm_name: hal9000              # VM name and hostname
vm_ram: 2048                  # RAM in MB
vm_vcpus: 1                   # Number of vCPUs
vm_disk_size: 10G             # VM disk size
```

### IP Address Configuration
```yaml
vm_ip_config:
  mode: dhcp                  # 'dhcp' or 'static'
  static_ip: "192.168.122.100"  # Required if mode is 'static'
  gateway: "192.168.122.1"
  netmask: "255.255.255.0"
  dns_servers:
    - "8.8.8.8"
    - "8.8.4.4"
```

### SSH Configuration
```yaml
ssh_public_key_file: ""       # Auto-detected if empty
generate_ssh_key: true        # Generate key if none found
```

### Workspace Configuration
```yaml
work_directory: "~/vm-workspace"           # Main workspace
vm_workspace_dir: "{{ work_directory }}/{{ vm_name }}"  # VM-specific folder
```

See `defaults/main.yml` for all configurable variables.

## Dependencies

- virtualization (should be run before this role)

## Example Playbook

### Basic VM with DHCP
```yaml
- hosts: localhost
  roles:
    - virtualization
    - vm-manager
```

### VM with Static IP
```yaml
- hosts: localhost
  roles:
    - virtualization
    - vm-manager
  vars:
    vm_name: web-server
    vm_hostname: web-server
    vm_ip_config:
      mode: static
      static_ip: "192.168.122.100"
      gateway: "192.168.122.1"
      netmask: "255.255.255.0"
```

### Multiple VMs with Different IPs
```yaml
# Create VM 1 with static IP
- hosts: localhost
  roles:
    - vm-manager
  vars:
    vm_name: database
    vm_ip_config:
      mode: static
      static_ip: "192.168.122.101"

# Create VM 2 with DHCP
- hosts: localhost
  roles:
    - vm-manager
  vars:
    vm_name: app-server
    vm_ip_config:
      mode: dhcp
```

## License

MIT

## Author Information

Created for microanpr-saas project
# Virtualization Role

This role installs and configures QEMU/KVM and libvirt for virtual machine management.

## Features

- Installs QEMU/KVM virtualization packages
- Configures libvirt daemon
- Sets up default network
- Adds user to libvirt group
- Verifies virtualization support

## Requirements

- Ubuntu/Debian system with virtualization support
- Sudo privileges

## Variables

See `defaults/main.yml` for configurable variables.

## Dependencies

None

## Example Playbook

```yaml
- hosts: localhost
  roles:
    - virtualization
```

## License

MIT

## Author Information

Created for microanpr-saas project
# Nextcloud Ansible Role

This Ansible role installs and configures Nextcloud on Ubuntu 22.04 using the snap package.

## Requirements

- Ubuntu 22.04 (may work on 20.04+)
- Ansible 2.9+
- `community.general` collection

## Role Variables

See `defaults/main.yml` for all available variables:

```yaml
nextcloud_admin_user: "admin"
nextcloud_admin_password: "changeme123"
nextcloud_ssl_type: "selfsigned"  # Options: letsencrypt, selfsigned, none
nextcloud_configure_firewall: true
```

For Let's Encrypt SSL:
```yaml
nextcloud_domain: "cloud.example.com"
nextcloud_letsencrypt_email: "admin@example.com"
nextcloud_ssl_type: "letsencrypt"
```

## Dependencies

None.

## Example Playbook

```yaml
- hosts: servers
  become: yes
  roles:
    - role: nextcloud
      vars:
        nextcloud_admin_user: "admin"
        nextcloud_admin_password: "SecurePassword123!"
        nextcloud_domain: "cloud.example.com"
        nextcloud_ssl_type: "letsencrypt"
        nextcloud_letsencrypt_email: "admin@example.com"
```

## License

MIT

## Author Information

Based on the [DigitalOcean Nextcloud tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-nextcloud-on-ubuntu-22-04).

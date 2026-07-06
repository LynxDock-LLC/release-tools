# Security Policy

## Reporting a vulnerability
Please report security issues privately to the LynxDock organization rather than
opening a public issue. Do not include exploit details in public channels.

## Scope
`release-tools` produces release manifests. Of particular importance:
- **Checksum integrity** - the tool only ever *consumes* checksums from signed
  `SHA256SUMS` files; it never fabricates them. Report any path that could emit
  an unverified or incorrect `sha256`.
- **Manifest tampering** - report anything that could cause a manifest to point
  at an incorrect or unofficial download URL.

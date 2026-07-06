# Changelog

## [0.1.0] - 2026-08-01
### Added
- Initial `release-tools` publisher.
- GitHub Release parser (adapter registry; handles `gh` output + webhook payloads).
- Filename-based platform detection (Windows/Linux/macOS/Server), extensible rules.
- SHA256 checksum consumption from `SHA256SUMS` files (never invents checksums).
- Deterministic `releases.json` manifest generator + schema validator.
- CLI: `build` and `validate`.
- Example release payload + expected manifest, unit + validation tests.
- Architecture and GitHub Actions design docs.

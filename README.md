# release-tools

The **publisher** for the LynxDock ecosystem. `release-tools` turns a GitHub
Release into the machine-readable `releases.json` manifest the website renders.

```
GitHub Release ──▶ release-tools ──▶ releases.json ──▶ Bootstrap ──▶ Website
```

It is intentionally the *only* component that touches CI, GitHub Releases,
checksums, and (in future) signing and installers. It is **not** part of GSpec,
Bootstrap, or the Website - keeping each repository single-purpose.

## Install / run

Zero runtime dependencies (Node ≥ 20 built-ins only).

```bash
npm test           # run the test suite (node --test)
npm run build      # build the example manifest to stdout
npm run lint       # syntax-check sources
```

## CLI

```bash
# Build a manifest from a GitHub Release JSON
release-tools build release.json
release-tools build --input release.json --output releases.json
release-tools build release.json --checksums SHA256SUMS

# Validate an existing manifest
release-tools validate releases.json
```

Options: `--output`, `--checksums`, `--channel`, `--docs`, `--released`.

## What it does

1. **Parses** GitHub Release JSON (also `gh` output and webhook payloads).
2. **Detects platforms** from asset filenames (Windows/Linux/macOS/Server).
3. **Consumes checksums** from a `SHA256SUMS` file if supplied - never invents them.
4. **Generates** a deterministic, schema-valid `releases.json`.
5. **Validates** inputs and output with useful errors.

## Output shape

```json
{
  "current": { "version": "0.1.0-alpha", "channel": "alpha", "released": true, "releaseDate": "2026-08-01", "notesUrl": "...", "githubUrl": "...", "docsUrl": "/docs/" },
  "downloads": [
    { "platform": "windows", "filename": "LynxDockSetup.exe", "url": "...", "size": "12.4 MB", "sha256": "", "available": true }
  ]
}
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/GITHUB-ACTIONS.md`](docs/GITHUB-ACTIONS.md).

## Ecosystem

| Repo | Role |
| --- | --- |
| `gspec` | Specification (products + release policy) |
| `bootstrap` | Compiler (spec → website/app assets) |
| `release-tools` | **Publisher (GitHub Release → releases.json)** |
| `website` | Renderer |

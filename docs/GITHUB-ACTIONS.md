# GitHub Actions

```
GitHub Release ──▶ GitHub Action ──▶ release-tools ──▶ releases.json (artifact) ──▶ [future] Website
```

## The workflow: `build-release-manifest.yml`

**Implemented (foundation).** On a published GitHub Release - or a manual run -
it builds and validates `releases.json` and uploads it as an artifact. It does
**not** use secrets, commit to other repos, or publish to Cloudflare yet.

### Triggers
- `release: [published]` - fires automatically when you publish a release.
- `workflow_dispatch` - manual runs for smoke testing, with optional inputs:
  `channel`, `docs_url`, `released`.

### Steps
1. Checkout `release-tools`.
2. Setup Node 20.
3. **Prepare payload** - on a `release` event, the published release object
   (`github.event.release`) is written to `release.json` via `toJSON`. On a
   manual run, `examples/github-release.json` is used instead.
4. **Build** - `node src/cli.mjs build release.json --output releases.json`
   (plus `--channel/--docs/--released` when supplied by manual inputs).
5. **Validate** - `node src/cli.mjs validate releases.json`.
6. **Upload artifact** - named **`lynxdock-releases-json`**, containing
   `releases.json`.

### Where `releases.json` appears
As a **workflow artifact** on the run's summary page (Actions → the run →
Artifacts → `lynxdock-releases-json`). Download it to inspect the manifest. It
is not yet published anywhere public.

## Manual test (no real release needed)
Actions → **Build release manifest** → **Run workflow**. Leave inputs at their
defaults (or set `channel`, `docs_url`, `released`). The run uses the bundled
example payload and produces the artifact.

## How this will later connect to `lynxdock-website`
Once the foundation is trusted, a follow-up adds a publish step that takes the
validated `releases.json` and either:
- commits it to `lynxdock-website/public/releases.json` (cross-repo token), or
- uploads it to a stable URL / release asset the site reads.

Cloudflare Pages then rebuilds and the Download Center enables itself - no code
change. That step needs a scoped token (secret) and is intentionally **out of
scope** for this milestone.

## Optional future step: checksums
If a `SHA256SUMS` asset is attached to the release, a step can download it and
pass `--checksums SHA256SUMS` so the manifest carries real `sha256` values.
Not enabled yet (keeps the foundation network- and secret-free).

## What remains before production automation
- A publish target for `releases.json` (website commit or hosted URL) + a
  scoped token stored as a secret.
- Checksum (and later signature) consumption in CI.
- Guardrails: only publish for non-draft, non-prerelease as policy dictates.

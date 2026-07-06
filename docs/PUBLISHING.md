# Publishing

One action deploys a release. Everything else is automatic.

```
Developer ─▶ GitHub Release ─▶ release-tools ─▶ lynxdock-website ─▶ Cloudflare ─▶ Users
```

Publishing a GitHub Release triggers `publish-release-manifest.yml`, which builds
and validates the manifest, runs guardrails, and commits
`public/releases.json` into `lynxdock-website`. Cloudflare Pages rebuilds and the
Download Center reflects the new release - no manual website edits, commits, or
deploys.

## One-time setup
- Create a repo secret **`WEBSITE_PUBLISH_TOKEN`**: a GitHub App installation
  token or fine-grained PAT scoped to **`contents: write` on
  `LynxDock-LLC/lynxdock-website` only**.
- Ensure release artifacts are named so platforms are detectable
  (`*.exe/.msi`, `*.AppImage/.deb/.rpm`, `*.dmg`, `*server*.tar.gz`).
- Attach a `SHA256SUMS` asset to get real checksums (recommended).

## Version & channel
`release-tools` reads the tag (`v0.1.0-alpha` → `0.1.0-alpha`) and infers the
channel from the version:

| Version contains | Channel |
| --- | --- |
| `nightly` | Nightly |
| `alpha` | Alpha |
| `beta` | Beta |
| (none) | Stable |

Override with `--channel` if needed.

## How to publish an Alpha
1. Tag `v0.1.0-alpha`, attach the platform artifacts (+ `SHA256SUMS`).
2. Publish the GitHub Release (leave "pre-release" checked if you like - alpha is
   still published).
3. The workflow runs; `public/releases.json` updates; the site goes live.

## How to publish a Beta
Same, with a `-beta` version (e.g. `v0.2.0-beta.1`).

## How to publish a Stable
Tag a clean semver with no pre-release suffix (e.g. `v1.0.0`) and publish.

## How to roll back
Options, fastest first:
- **Revert** the `Update releases.json for vX.Y.Z` commit in `lynxdock-website`
  (or `git revert`); Cloudflare rebuilds to the previous manifest.
- **Re-publish** the previous GitHub Release (or edit the current one and
  re-run the workflow) to regenerate the older manifest.

## How to invalidate a release
- **Unpublish**: edit the GitHub Release to a draft, then revert the website
  commit (or push a manifest with `released: false`). The Download Center falls
  back to the Development Preview state.
- To pull a single platform, set that artifact unavailable (remove the asset and
  re-run) - the card disables while the others stay live.

## Guardrails (the workflow refuses to publish when)
- the release is a **draft**;
- **manifest validation** fails (schema);
- **checksum validation** fails (`--require-checksums`, when a `SHA256SUMS`
  asset is present);
- **`released` is not true**;
- the **version is missing/malformed**;
- the **version duplicates** the one already published.

## Two workflows
- `build-release-manifest.yml` - safe foundation: builds/validates and uploads
  the manifest as an artifact (no secrets, no cross-repo writes). Great for
  testing.
- `publish-release-manifest.yml` - the real publish loop (this doc). Uses the
  scoped token to commit into the website.

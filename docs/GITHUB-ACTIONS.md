# GitHub Actions (design - not implemented)

```
GitHub Release ──▶ GitHub Action ──▶ release-tools ──▶ releases.json ──▶ Website
```

## Intended workflow

On `release: published`, a workflow would:

1. Check out `release-tools`.
2. Fetch the release JSON (the event payload already contains it, or
   `gh release view <tag> --json ...`).
3. Optionally fetch the `SHA256SUMS` asset.
4. Run `release-tools build release.json --checksums SHA256SUMS --output releases.json`.
5. Publish `releases.json` - commit it to the website repo (or upload to a
   stable URL / release asset).
6. The website rebuild (Cloudflare Pages) picks it up; the Download Center lights
   up automatically.

## Sketch (illustrative only - do not enable yet)

```yaml
name: publish-release
on:
  release:
    types: [published]
jobs:
  manifest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: echo "$RELEASE_JSON" > release.json
        env: { RELEASE_JSON: ${{ toJSON(github.event.release) }} }
      - run: node src/cli.mjs build release.json --output releases.json
      # - then commit/publish releases.json to the website
```

## Why keep Actions out of Bootstrap

Bootstrap is a pure compiler; giving it CI credentials and release-fetching
logic would blur responsibilities. `release-tools` owns the CI surface so
Bootstrap stays deterministic and offline-friendly.

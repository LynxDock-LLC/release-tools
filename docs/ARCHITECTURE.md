# Architecture

`release-tools` is a small, dependency-free pipeline:

```
input JSON ──▶ parse (adapters) ──▶ normalized release ──▶ buildManifest ──▶ validate ──▶ releases.json
                                                     ▲
                                          checksums (optional)
```

## Modules

| Module | Responsibility |
| --- | --- |
| `src/parse.mjs` | Adapters. `fromGitHubRelease` normalizes tag/date/assets. Registry allows new input formats. |
| `src/platforms.mjs` | Ordered filename→platform rules (extensible) + checksum-file detection. |
| `src/checksums.mjs` | Parse `SHA256SUMS` into `{filename: hash}`. Never computes hashes. |
| `src/manifest.mjs` | Build the deterministic manifest; stable platform ordering; validation errors. |
| `src/schema.mjs` | Manifest schema + dependency-free validator. |
| `src/cli.mjs` | `build` / `validate` commands. |

## Design principles

- **Single responsibility.** Publishing only. Rendering is the website's job;
  compiling is Bootstrap's; the spec is GSpec's.
- **Never invent data.** Checksums come only from provided files; unknown fields
  stay blank.
- **Deterministic.** Same input → byte-identical output (stable ordering, pretty
  JSON), so manifests diff cleanly in git/CI.
- **Extensible.** Platform rules and input adapters are data/registries, not
  hard-coded branches.

## Relationship to the ecosystem

- **GSpec** declares release *policy* (channels, platforms) in `releases.yaml`.
- **Bootstrap** emits a *placeholder* `releases.json` for offline/dev.
- **release-tools** produces the *real* `releases.json` from an actual GitHub
  Release. Its output conforms to the same shape the website already renders.

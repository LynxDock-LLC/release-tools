# Contributing to release-tools

Thanks for your interest in LynxDock.

## Development
- Node ≥ 20. No runtime dependencies.
- `npm test` - run the suite. `npm run lint` - syntax check.
- Keep output **deterministic**: same input must produce byte-identical
  `releases.json`. Add a test for any new behavior.

## Pull requests
- One focused change per PR. Update `CHANGELOG.md`.
- New platform rules or input adapters should come with tests and an example.

## Principles
- Never invent release data (checksums, sizes, URLs).
- Keep `release-tools` single-purpose: publishing only.

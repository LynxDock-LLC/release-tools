import { detectPlatform, isChecksumFile, PLATFORM_ORDER } from "./platforms.mjs";

const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/;

// Build a releases.json manifest from normalized parse output.
// Returns { manifest, errors }. Deterministic, stable platform ordering.
export function buildManifest(parsed, opts = {}) {
  const errors = [];
  const { checksums = {}, docsUrl = "/docs/", released = true, channel } = opts;

  if (!parsed.version || !SEMVER.test(parsed.version))
    errors.push(`malformed version: '${parsed.version ?? ""}'`);
  if (!parsed.releaseDate) errors.push("missing release date");

  const assets = (parsed.assets ?? []).filter((a) => !isChecksumFile(a.filename));
  if (assets.length === 0) errors.push("no downloadable assets found");

  const seen = new Set();
  const downloads = [];
  for (const a of assets) {
    const platform = detectPlatform(a.filename);
    if (!platform) {
      errors.push(`unknown platform for asset: '${a.filename}'`);
      continue;
    }
    if (seen.has(platform)) {
      errors.push(`duplicate platform '${platform}' (asset '${a.filename}')`);
      continue;
    }
    seen.add(platform);
    downloads.push({
      platform,
      filename: a.filename,
      url: a.url || "",
      size: a.size || "",
      sha256: checksums[a.filename] || "",
      available: Boolean(a.url),
    });
  }
  downloads.sort(
    (x, y) => PLATFORM_ORDER.indexOf(x.platform) - PLATFORM_ORDER.indexOf(y.platform)
  );

  if (opts.requireChecksums) {
    for (const d of downloads) {
      if (d.available && !d.sha256)
        errors.push(`missing checksum for '${d.filename}' (--require-checksums)`);
    }
  }

  const manifest = {
    current: {
      version: parsed.version,
      channel: channel || parsed.channel,
      released: Boolean(released),
      releaseDate: parsed.releaseDate || null,
      notesUrl: parsed.notesUrl || "",
      githubUrl: parsed.githubUrl || "",
      docsUrl,
    },
    downloads,
  };
  return { manifest, errors };
}

// Deterministic, pretty, newline-terminated JSON.
export function serialize(manifest) {
  return JSON.stringify(manifest, null, 2) + "\n";
}

// The releases.json manifest schema (shared shape with the website) plus a
// small dependency-free validator.
export const CHANNELS = ["nightly", "alpha", "beta", "stable"];
export const PLATFORMS = ["windows", "linux", "macos", "server"];

export function validateManifest(m) {
  const errors = [];
  if (!m || typeof m !== "object") return ["manifest is not an object"];

  const c = m.current;
  if (!c || typeof c !== "object") {
    errors.push("current: missing");
  } else {
    if (!c.version) errors.push("current.version: required");
    else if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/.test(c.version))
      errors.push(`current.version: malformed ('${c.version}')`);
    if (!c.channel) errors.push("current.channel: required");
    else if (!CHANNELS.includes(c.channel))
      errors.push(`current.channel: invalid ('${c.channel}')`);
    if (typeof c.released !== "boolean") errors.push("current.released: must be boolean");
    if (c.released && !c.releaseDate) errors.push("current.releaseDate: required when released");
  }

  if (!Array.isArray(m.downloads) || m.downloads.length === 0) {
    errors.push("downloads: must be a non-empty array");
  } else {
    const seen = new Set();
    m.downloads.forEach((d, i) => {
      if (!d.platform) errors.push(`downloads[${i}].platform: required`);
      else if (!PLATFORMS.includes(d.platform))
        errors.push(`downloads[${i}].platform: unknown ('${d.platform}')`);
      else if (seen.has(d.platform)) errors.push(`downloads[${i}].platform: duplicate ('${d.platform}')`);
      else seen.add(d.platform);
      if (!d.filename) errors.push(`downloads[${i}].filename: required`);
      if (typeof d.available !== "boolean") errors.push(`downloads[${i}].available: must be boolean`);
    });
  }
  return errors;
}

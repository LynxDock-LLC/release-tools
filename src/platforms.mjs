// Platform detection from asset filenames. Ordered rules; first match wins.
// Extensible: pass a custom rule list to detectPlatform().
export const PLATFORM_ORDER = ["windows", "linux", "macos", "server"];

export const RULES = [
  { platform: "server", patterns: [/server/i] },
  { platform: "windows", patterns: [/\.exe$/i, /\.msi$/i, /win(?:dows|64|32)?/i] },
  { platform: "macos", patterns: [/\.dmg$/i, /\.pkg$/i, /mac(?:os)?/i, /darwin/i, /osx/i] },
  { platform: "linux", patterns: [/\.appimage$/i, /\.deb$/i, /\.rpm$/i, /linux/i] },
  // Generic archives fall through to linux unless a token above claimed them.
  { platform: "linux", patterns: [/\.tar\.gz$/i, /\.tgz$/i, /\.zip$/i] },
];

const CHECKSUM_PATTERNS = [/sha256sums/i, /\.sha256$/i, /checksums?\.txt$/i];
export function isChecksumFile(name) {
  return CHECKSUM_PATTERNS.some((p) => p.test(name));
}

export function detectPlatform(filename, rules = RULES) {
  if (!filename) return null;
  for (const rule of rules) {
    if (rule.patterns.some((p) => p.test(filename))) return rule.platform;
  }
  return null;
}

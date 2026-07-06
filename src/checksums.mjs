// Consume checksum files. Never invent checksums - only read provided ones.
// Parses a SHA256SUMS-style file: lines of "<64-hex>  <filename>".
export function parseSha256Sums(text) {
  const map = {};
  if (!text) return map;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([0-9a-fA-F]{64})\s+\*?(.+)$/);
    if (m) map[m[2].trim()] = m[1].toLowerCase();
  }
  return map;
}

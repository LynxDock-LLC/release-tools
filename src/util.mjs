// Format a byte count into a compact human string. Never guesses when unknown.
export function formatSize(bytes) {
  if (bytes === undefined || bytes === null || Number.isNaN(Number(bytes))) return "";
  const b = Number(bytes);
  if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

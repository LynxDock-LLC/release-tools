// Input adapters. Currently: GitHub Release API JSON (also handles `gh` output
// and webhook payloads). Designed so more adapters can be registered later.
import { formatSize } from "./util.mjs";

export function inferChannel(version) {
  const v = String(version).toLowerCase();
  if (v.includes("nightly")) return "nightly";
  if (v.includes("alpha")) return "alpha";
  if (v.includes("beta")) return "beta";
  return "stable";
}

export function fromGitHubRelease(input) {
  if (!input || typeof input !== "object") throw new Error("invalid release JSON");
  // Webhook payloads wrap the release under `release`.
  const r = input.release && typeof input.release === "object" ? input.release : input;

  const tag = r.tag_name ?? r.tagName ?? "";
  const version = String(tag).replace(/^v/, "");
  const publishedAt = r.published_at ?? r.publishedAt ?? null;
  const releaseDate = publishedAt ? String(publishedAt).slice(0, 10) : null;
  const htmlUrl = r.html_url ?? r.htmlUrl ?? "";
  const githubUrl = htmlUrl ? htmlUrl.split("/releases/")[0] : "";

  const assets = (r.assets ?? []).map((a) => ({
    filename: a.name ?? a.filename ?? "",
    url: a.browser_download_url ?? a.url ?? "",
    size: formatSize(a.size),
    bytes: a.size ?? null,
  }));

  return { version, channel: inferChannel(version), releaseDate, notesUrl: htmlUrl, githubUrl, assets };
}

// Adapter registry - add new input formats here.
export const adapters = { github: fromGitHubRelease };

export function parseInput(json, adapter = "github") {
  const fn = adapters[adapter];
  if (!fn) throw new Error(`unknown adapter: ${adapter}`);
  return fn(json);
}

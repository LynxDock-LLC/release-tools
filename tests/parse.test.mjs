import test from "node:test";
import assert from "node:assert/strict";
import { fromGitHubRelease, inferChannel } from "../src/parse.mjs";

test("infers channel from version", () => {
  assert.equal(inferChannel("0.1.0-alpha"), "alpha");
  assert.equal(inferChannel("0.2.0-beta.1"), "beta");
  assert.equal(inferChannel("0.0.1-nightly"), "nightly");
  assert.equal(inferChannel("1.0.0"), "stable");
});
test("parses a GitHub release", () => {
  const p = fromGitHubRelease({
    tag_name: "v0.1.0-alpha",
    published_at: "2026-08-01T12:00:00Z",
    html_url: "https://github.com/LynxDock-LLC/lynxdock/releases/tag/v0.1.0-alpha",
    assets: [{ name: "LynxDockSetup.exe", browser_download_url: "https://x/LynxDockSetup.exe", size: 13000000 }],
  });
  assert.equal(p.version, "0.1.0-alpha");
  assert.equal(p.channel, "alpha");
  assert.equal(p.releaseDate, "2026-08-01");
  assert.equal(p.githubUrl, "https://github.com/LynxDock-LLC/lynxdock");
  assert.equal(p.assets[0].size, "12.4 MB");
});
test("unwraps webhook payloads", () => {
  const p = fromGitHubRelease({ action: "published", release: { tag_name: "v1.0.0", published_at: "2026-01-01T00:00:00Z", assets: [] } });
  assert.equal(p.version, "1.0.0");
});

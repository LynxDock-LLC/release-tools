import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fromGitHubRelease } from "../src/parse.mjs";
import { buildManifest, serialize } from "../src/manifest.mjs";
import { parseSha256Sums } from "../src/checksums.mjs";

test("build matches the committed example output (deterministic)", () => {
  const rel = JSON.parse(readFileSync("examples/github-release.json", "utf8"));
  const { manifest, errors } = buildManifest(fromGitHubRelease(rel));
  assert.deepEqual(errors, []);
  assert.equal(serialize(manifest), readFileSync("examples/releases.json", "utf8"));
});
test("skips checksum files and orders platforms", () => {
  const rel = JSON.parse(readFileSync("examples/github-release.json", "utf8"));
  const { manifest } = buildManifest(fromGitHubRelease(rel));
  assert.deepEqual(manifest.downloads.map((d) => d.platform), ["windows", "linux", "macos", "server"]);
});
test("consumes checksums when provided, never invents them", () => {
  const rel = JSON.parse(readFileSync("examples/github-release.json", "utf8"));
  const sums = parseSha256Sums(
    "a".repeat(64) + "  LynxDockSetup.exe\n" + "b".repeat(64) + "  LynxDock.dmg\n"
  );
  const { manifest } = buildManifest(fromGitHubRelease(rel), { checksums: sums });
  const win = manifest.downloads.find((d) => d.platform === "windows");
  const linux = manifest.downloads.find((d) => d.platform === "linux");
  assert.equal(win.sha256, "a".repeat(64));
  assert.equal(linux.sha256, ""); // not in sums -> blank, not invented
});

import test from "node:test";
import assert from "node:assert/strict";
import { buildManifest } from "../src/manifest.mjs";
import { validateManifest } from "../src/schema.mjs";

const base = { version: "0.1.0", channel: "stable", releaseDate: "2026-01-01" };

test("malformed version errors", () => {
  const { errors } = buildManifest({ ...base, version: "abc", assets: [{ filename: "a.exe", url: "u" }] });
  assert.ok(errors.some((e) => /version/.test(e)));
});
test("missing release date errors", () => {
  const { errors } = buildManifest({ version: "0.1.0", channel: "stable", assets: [{ filename: "a.exe", url: "u" }] });
  assert.ok(errors.some((e) => /release date/.test(e)));
});
test("unknown platform errors", () => {
  const { errors } = buildManifest({ ...base, assets: [{ filename: "notes.md", url: "u" }] });
  assert.ok(errors.some((e) => /unknown platform/.test(e)));
});
test("duplicate platform errors", () => {
  const { errors } = buildManifest({ ...base, assets: [{ filename: "a.exe", url: "u" }, { filename: "b.exe", url: "v" }] });
  assert.ok(errors.some((e) => /duplicate platform/.test(e)));
});
test("missing assets errors", () => {
  const { errors } = buildManifest({ ...base, assets: [] });
  assert.ok(errors.some((e) => /no downloadable assets/.test(e)));
});
test("schema validation catches a bad manifest", () => {
  assert.ok(validateManifest({ current: {}, downloads: [] }).length > 0);
});
test("schema validation passes a good manifest", () => {
  const { manifest } = buildManifest({ ...base, assets: [{ filename: "a.exe", url: "u" }] });
  assert.deepEqual(validateManifest(manifest), []);
});

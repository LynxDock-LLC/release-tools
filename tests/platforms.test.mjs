import test from "node:test";
import assert from "node:assert/strict";
import { detectPlatform, isChecksumFile } from "../src/platforms.mjs";

test("detects windows", () => {
  assert.equal(detectPlatform("LynxDockSetup.exe"), "windows");
  assert.equal(detectPlatform("LynxDock-1.0.msi"), "windows");
});
test("detects macos", () => {
  assert.equal(detectPlatform("LynxDock.dmg"), "macos");
  assert.equal(detectPlatform("LynxDock-mac.zip"), "macos");
});
test("detects linux", () => {
  assert.equal(detectPlatform("LynxDock.AppImage"), "linux");
  assert.equal(detectPlatform("lynxdock.deb"), "linux");
  assert.equal(detectPlatform("LynxDock.zip"), "linux");
});
test("server wins over generic archive", () => {
  assert.equal(detectPlatform("lynxdock-server.tar.gz"), "server");
});
test("unknown returns null", () => {
  assert.equal(detectPlatform("README.md"), null);
});
test("recognizes checksum files", () => {
  assert.equal(isChecksumFile("SHA256SUMS"), true);
  assert.equal(isChecksumFile("LynxDock.exe.sha256"), true);
  assert.equal(isChecksumFile("LynxDock.exe"), false);
});

#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { parseInput } from "./parse.mjs";
import { parseSha256Sums } from "./checksums.mjs";
import { buildManifest, serialize } from "./manifest.mjs";
import { validateManifest } from "./schema.mjs";

const HELP = `release-tools - turn a GitHub Release into releases.json

Usage:
  release-tools build <release.json> [options]
  release-tools validate <releases.json>

Options (build):
  --input <file>        Release JSON input (alternative to positional)
  --output <file>       Write manifest to file (default: stdout)
  --checksums <file>    SHA256SUMS file to consume (optional)
  --channel <id>        Override channel (nightly|alpha|beta|stable)
  --docs <url>          docsUrl for the manifest (default: /docs/)
  --released <bool>     Override released flag (default: true)
  --require-checksums   Fail if any available download lacks a sha256
  -h, --help            Show this help
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

function fail(msg, errors) {
  console.error(`error: ${msg}`);
  (errors || []).forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

function cmdBuild(args) {
  const inputPath = args.input || args._[1];
  if (!inputPath) fail("build: no input release JSON provided");
  let release;
  try {
    release = JSON.parse(readFileSync(inputPath, "utf8"));
  } catch (e) {
    fail(`build: cannot read/parse '${inputPath}' - ${e.message}`);
  }

  let checksums = {};
  if (args.checksums) {
    try {
      checksums = parseSha256Sums(readFileSync(args.checksums, "utf8"));
    } catch (e) {
      fail(`build: cannot read checksums '${args.checksums}' - ${e.message}`);
    }
  }

  const parsed = parseInput(release);
  const { manifest, errors } = buildManifest(parsed, {
    checksums,
    docsUrl: args.docs || "/docs/",
    channel: args.channel,
    released: args.released === undefined ? true : args.released !== "false",
    requireChecksums: args["require-checksums"] === true || args["require-checksums"] === "true",
  });
  if (errors.length) fail("build: invalid release input", errors);

  const schemaErrors = validateManifest(manifest);
  if (schemaErrors.length) fail("build: generated manifest failed schema", schemaErrors);

  const out = serialize(manifest);
  if (args.output) {
    writeFileSync(args.output, out);
    console.error(`wrote ${args.output}`);
  } else {
    process.stdout.write(out);
  }
}

function cmdValidate(args) {
  const path = args._[1] || args.input;
  if (!path) fail("validate: no releases.json provided");
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`validate: cannot read/parse '${path}' - ${e.message}`);
  }
  const errors = validateManifest(manifest);
  if (errors.length) fail("validate: manifest is invalid", errors);
  console.error(`ok: ${path} is a valid releases manifest`);
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
if (args.help || !cmd) {
  process.stdout.write(HELP);
  process.exit(args.help ? 0 : 1);
} else if (cmd === "build") {
  cmdBuild(args);
} else if (cmd === "validate") {
  cmdValidate(args);
} else {
  fail(`unknown command: '${cmd}'`);
}

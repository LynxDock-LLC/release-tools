import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
let bad = 0;
for (const dir of ["src", "scripts"]) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".mjs")) continue;
    try {
      execFileSync(process.execPath, ["--check", `${dir}/${f}`]);
    } catch {
      console.error(`lint: syntax error in ${dir}/${f}`);
      bad++;
    }
  }
}
console.log(bad ? `lint: ${bad} file(s) failed` : "lint: ok");
process.exit(bad ? 1 : 0);

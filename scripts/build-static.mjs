/**
 * Builds a fully static copy of the demo into ./out and zips it as
 * boostreviews-netlify.zip — drag the zip (or the out/ folder) onto
 * https://app.netlify.com/drop. API routes are excluded from this build;
 * the demo falls back to local logic for every one of them.
 */
import { execSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";

const api = "src/app/api";
const parked = ".api-parked";
const proxy = "src/proxy.ts";
const proxyParked = ".proxy-parked.ts";
const run = (cmd) => execSync(cmd, { stdio: "inherit", env: { ...process.env, STATIC_EXPORT: "1", NEXT_PUBLIC_STATIC_DEMO: "1" } });

rmSync("out", { recursive: true, force: true });
rmSync(".next", { recursive: true, force: true });
if (existsSync(api)) renameSync(api, parked);
if (existsSync(proxy)) renameSync(proxy, proxyParked);
try {
  run("npx next build");
} finally {
  if (existsSync(parked)) renameSync(parked, api);
  if (existsSync(proxyParked)) renameSync(proxyParked, proxy);
}
rmSync("boostreviews-netlify.zip", { force: true });
execSync("cd out && zip -qr ../boostreviews-netlify.zip .", { stdio: "inherit" });
console.log("\nStatic site in ./out — zip: boostreviews-netlify.zip");

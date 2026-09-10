import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ABOUT_FALLBACK } from "../src/data/fallback/about.fallback";
import { COMPANIES_FALLBACK } from "../src/data/fallback/companies.fallback";
import { ENTRIES_FALLBACK } from "../src/data/fallback/entries.fallback";
import { FAQ_FALLBACK } from "../src/data/fallback/faq.fallback";
import { PRIVACY_FALLBACK } from "../src/data/fallback/privacy.fallback";
import { SERVICES_FALLBACK } from "../src/data/fallback/services.fallback";
import { SETTINGS_FALLBACK } from "../src/data/fallback/settings.fallback";
import { USES_FALLBACK } from "../src/data/fallback/uses.fallback";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const workerDir = path.join(rootDir, "portfolio-cms-worker");
const wranglerJs = path.join(workerDir, "node_modules", "wrangler", "bin", "wrangler.js");
const bucketName = process.env.R2_BUCKET_NAME || "mdfayaz";
const workDir = path.join(rootDir, ".r2-migration");

const collections = [
  { key: "data/entries.json", value: ENTRIES_FALLBACK },
  { key: "data/services.json", value: SERVICES_FALLBACK },
  { key: "data/companies.json", value: COMPANIES_FALLBACK },
  { key: "data/faq.json", value: FAQ_FALLBACK },
  { key: "data/uses.json", value: USES_FALLBACK },
  { key: "data/privacy.json", value: PRIVACY_FALLBACK },
  { key: "data/about.json", value: ABOUT_FALLBACK },
  { key: "data/site-settings.json", value: SETTINGS_FALLBACK },
] as const;

function runWrangler(args: string[]): void {
  const result = spawnSync("node", [wranglerJs, ...args], {
    cwd: workerDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(`Wrangler failed: wrangler ${args.join(" ")}`);
  }
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function assertWranglerReady(): void {
  if (!existsSync(wranglerJs)) {
    throw new Error(`Wrangler is not installed at ${wranglerJs}. Run npm install in portfolio-cms-worker first.`);
  }
}

function main(): void {
  assertWranglerReady();
  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  console.log(`Preparing ${collections.length} CMS collections from src/data/fallback.`);
  for (const item of collections) {
    const fileName = item.key.replace(/[\\/]/g, "__");
    const sourceFile = path.join(workDir, fileName);
    writeFileSync(sourceFile, stableStringify(item.value), "utf8");

    const objectPath = `${bucketName}/${item.key}`;
    console.log(`Uploading ${objectPath}`);
    runWrangler(["r2", "object", "put", objectPath, "--file", sourceFile, "--content-type", "application/json"]);

    const downloadedFile = `${sourceFile}.downloaded`;
    console.log(`Verifying ${objectPath}`);
    runWrangler(["r2", "object", "get", objectPath, "--file", downloadedFile]);

    const uploaded = JSON.parse(readFileSync(downloadedFile, "utf8"));
    const expected = JSON.parse(readFileSync(sourceFile, "utf8"));
    if (stableStringify(uploaded) !== stableStringify(expected)) {
      throw new Error(`Verification failed for ${item.key}: downloaded JSON does not match local source.`);
    }
  }

  console.log("R2 content migration verified successfully.");
}

main();

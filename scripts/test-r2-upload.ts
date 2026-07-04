import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config({ path: path.join(rootDir, ".env") });

const apiBaseUrl = (process.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const username = process.env.VITE_ADMIN_USERNAME || process.env.ADMIN_USERNAME || "";
const password = process.env.VITE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

async function readWorkerDevVars(): Promise<void> {
  const devVarsPath = path.join(rootDir, "portfolio-cms-worker", ".dev.vars");
  try {
    const content = await readFile(devVarsPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      process.env[key] ||= rest.join("=");
    }
  } catch {
    // Optional local helper only.
  }
}

async function main(): Promise<void> {
  await readWorkerDevVars();

  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is required to test Worker uploads.");
  }
  if (!username || !password) {
    throw new Error("VITE_ADMIN_USERNAME and VITE_ADMIN_PASSWORD are required to log in before upload testing.");
  }

  const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!loginResponse.ok) {
    throw new Error(`Login failed with ${loginResponse.status}: ${await loginResponse.text()}`);
  }

  const loginBody = await loginResponse.json() as { token?: string };
  if (!loginBody.token) {
    throw new Error("Login succeeded but did not return a token.");
  }

  const form = new FormData();
  form.append("category", "upload-test");
  form.append("file", new Blob([onePixelPng], { type: "image/png" }), "codex-r2-upload-test.png");

  const uploadResponse = await fetch(`${apiBaseUrl}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${loginBody.token}` },
    body: form,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Upload failed with ${uploadResponse.status}: ${await uploadResponse.text()}`);
  }

  const uploadBody = await uploadResponse.json() as { url?: string };
  if (!uploadBody.url) {
    throw new Error("Upload succeeded but did not return a public URL.");
  }

  const assetResponse = await fetch(uploadBody.url);
  if (!assetResponse.ok) {
    throw new Error(`Uploaded asset URL did not load: ${assetResponse.status} ${uploadBody.url}`);
  }

  const contentType = assetResponse.headers.get("content-type") || "";
  if (!contentType.includes("image/png")) {
    throw new Error(`Uploaded asset returned unexpected content-type: ${contentType}`);
  }

  console.log(`Upload test passed: ${uploadBody.url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

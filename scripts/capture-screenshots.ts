import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const BASE_URL = "http://localhost:3000";
const ADMIN_USER = process.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.VITE_ADMIN_PASSWORD || "changeme";

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const THEMES = ["light", "dark"] as const;

// Name to hash maps
const PUBLIC_ROUTES = {
  about: "#about",
  work: "#work",
  uses: "#uses",
  faq: "#faq",
  privacy: "#privacy",
  contact: "#contact",
  "admin-login": "#admin/login",
};

async function main() {
  console.log("Starting optimized screenshot capture script...");
  const screenshotsDir = path.resolve(process.cwd(), "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log(`Created directory: ${screenshotsDir}`);
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // We will loop over sizes and themes (4 combinations)
    for (const [size, viewport] of Object.entries(VIEWPORTS)) {
      for (const theme of THEMES) {
        console.log(`\n--- Launching context for [${size.toUpperCase()}] at [${theme.toUpperCase()}] theme ---`);
        
        const context = await browser.newContext({
          viewport,
          isMobile: size === "mobile",
        });

        // Set the storage theme variable prior to any navigation
        await context.addInitScript((t) => {
          window.localStorage.setItem("portfolio-theme", t);
        }, theme);

        const page = await context.newPage();

        // 1. Capture public pages (including admin-login)
        for (const [name, hash] of Object.entries(PUBLIC_ROUTES)) {
          const filename = `${name}-${theme}-${size}.png`;
          const filepath = path.join(screenshotsDir, filename);

          console.log(`Capturing: ${filename}`);
          await page.goto(`${BASE_URL}/${hash}`);
          
          // Brief sleep for react transitions of client router to complete
          await page.waitForTimeout(600);
          
          await page.screenshot({ path: filepath, fullPage: true });
        }

        // 2. Perform Login and capture Admin Dashboard
        const dashboardFilename = `admin-dashboard-${theme}-${size}.png`;
        const dashboardFilepath = path.join(screenshotsDir, dashboardFilename);

        console.log(`Logging in on [${size.toUpperCase()}] [${theme.toUpperCase()}] configuration...`);
        await page.goto(`${BASE_URL}/#admin/login`);
        await page.waitForTimeout(600);

        // Fill inputs
        await page.fill("#admin-username-input", ADMIN_USER);
        await page.fill("#admin-password-input", ADMIN_PASS);
        
        // Wait and click
        await page.click("#admin-login-submit");

        // Wait for routing
        await page.waitForURL(/\/#admin($|\/)/, { timeout: 10000 });
        await page.waitForTimeout(800); // Wait for transition fade-in

        console.log(`Capturing: ${dashboardFilename}`);
        await page.screenshot({ path: dashboardFilepath, fullPage: true });

        // Clean up context for next run
        await context.close();
      }
    }

    console.log("\nScreenshot capture process completed successfully!");

    // List all files in /screenshots/ directory
    const files = fs.readdirSync(screenshotsDir);
    console.log("\nTotal screenshot files generated:");
    files.forEach((file) => {
      console.log(`- ${path.join(screenshotsDir, file)}`);
    });

  } catch (err) {
    console.error("Error during screenshot capture:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

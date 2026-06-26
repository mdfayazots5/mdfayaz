import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const templatePath = path.resolve(process.cwd(), "src/og-template/index.html");
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}`);
  }
  
  await page.goto(`file://${templatePath}`);
  await page.setViewportSize({ width: 1200, height: 630 });
  
  // Wait for Google Fonts and layouts to render
  await page.waitForTimeout(2000);
  
  const outputPath = path.resolve(process.cwd(), "public/og-image.png");
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  await page.screenshot({ path: outputPath, type: "png" });
  console.log(`Successfully generated OG image at ${outputPath}`);
  
  await browser.close();
}

generate().catch((err) => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});

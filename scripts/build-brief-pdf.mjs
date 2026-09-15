/**
 * Renders the Internal Service Brief template to a one-page PDF plus a PNG
 * preview for the Hub page.
 *
 * Source:  templates/internal-service-brief/internal-service-brief.html
 * Output:  public/templates/internal-service-brief/
 *
 * Run: node scripts/build-brief-pdf.mjs
 *
 * Uses the locally installed Chrome rather than a bundled Chromium — this is a
 * build step for a static asset, not a runtime dependency of the Hub.
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const SRC_DIR = "templates/internal-service-brief";
const OUT_DIR = "public/templates/internal-service-brief";
const PDF = `${OUT_DIR}/web-wizards-internal-service-brief-template.pdf`;
const PNG = `${OUT_DIR}/web-wizards-internal-service-brief-preview.png`;

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

function findChrome() {
  const found = CHROME_CANDIDATES.find((path) => existsSync(path));
  if (!found) {
    throw new Error(
      "Chrome not found. Set one of the paths in CHROME_CANDIDATES.",
    );
  }
  return found;
}

mkdirSync(OUT_DIR, { recursive: true });

// The template references the lockup relatively so it resolves under file://.
copyFileSync(
  "public/brand/derived/webwizards-lockup-on-light.svg",
  `${SRC_DIR}/lockup.svg`,
);

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
  await page.goto(
    pathToFileURL(resolve(`${SRC_DIR}/internal-service-brief.html`)).href,
    { waitUntil: "networkidle0" },
  );
  await page.evaluateHandle("document.fonts.ready");

  // Fail loudly rather than shipping a silently-fallback-font PDF.
  const usingInter = await page.evaluate(() =>
    document.fonts.check('600 12px Inter'),
  );
  if (!usingInter) {
    throw new Error("Inter did not load — check network access to Google Fonts.");
  }

  // Warn if the content has outgrown one page.
  const overflow = await page.evaluate(() => {
    const pageHeight = 11 * 96;
    return { scrollHeight: document.body.scrollHeight, pageHeight };
  });
  if (overflow.scrollHeight > overflow.pageHeight + 2) {
    throw new Error(
      `Content is ${overflow.scrollHeight}px against a ${overflow.pageHeight}px page — trim the template.`,
    );
  }

  await page.pdf({
    path: PDF,
    format: "letter",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await page.screenshot({ path: PNG, fullPage: true });
} finally {
  await browser.close();
}

console.log(`${PDF}  ${(statSync(PDF).size / 1024).toFixed(0)} KB`);
console.log(`${PNG}  ${(statSync(PNG).size / 1024).toFixed(0)} KB`);

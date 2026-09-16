/**
 * Renders the Hub's document templates to one-page PDFs plus PNG previews.
 *
 * Sources live in `templates/<name>/<name>.html`; output goes to
 * `public/templates/<name>/`. Add a document by appending to DOCS below.
 *
 * Run: node scripts/build-pdfs.mjs
 *
 * Uses the locally installed Chrome rather than a bundled Chromium — this is a
 * build step for static assets, not a runtime dependency of the Hub.
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const DOCS = [
  {
    name: "internal-service-brief",
    pdf: "web-wizards-internal-service-brief-template.pdf",
    png: "web-wizards-internal-service-brief-preview.png",
  },
  {
    name: "social-media-account-guide",
    pdf: "web-wizards-social-media-account-guide-example.pdf",
    png: "web-wizards-social-media-account-guide-preview.png",
  },
];

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

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

try {
  for (const doc of DOCS) {
    const srcDir = `templates/${doc.name}`;
    const outDir = `public/templates/${doc.name}`;
    mkdirSync(outDir, { recursive: true });

    // Templates reference the lockup relatively so it resolves under file://.
    copyFileSync(
      "public/brand/derived/webwizards-lockup-on-light.svg",
      `${srcDir}/lockup.svg`,
    );

    const page = await browser.newPage();
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
    await page.goto(
      pathToFileURL(resolve(`${srcDir}/${doc.name}.html`)).href,
      { waitUntil: "networkidle0" },
    );
    await page.evaluateHandle("document.fonts.ready");

    // Fail loudly rather than shipping a silently-fallback-font PDF.
    const usingInter = await page.evaluate(() =>
      document.fonts.check("600 12px Inter"),
    );
    if (!usingInter) {
      throw new Error(
        `${doc.name}: Inter did not load — check network access to Google Fonts.`,
      );
    }

    // Refuse to ship a two-page one-pager.
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const pageHeight = 11 * 96;
    if (scrollHeight > pageHeight + 2) {
      throw new Error(
        `${doc.name}: content is ${scrollHeight}px against a ${pageHeight}px page — trim the template.`,
      );
    }

    await page.pdf({
      path: `${outDir}/${doc.pdf}`,
      format: "letter",
      printBackground: true,
      preferCSSPageSize: true,
    });
    await page.screenshot({ path: `${outDir}/${doc.png}`, fullPage: true });
    await page.close();

    const kb = (p) => (statSync(p).size / 1024).toFixed(0);
    console.log(`${outDir}/${doc.pdf}  ${kb(`${outDir}/${doc.pdf}`)} KB`);
    console.log(`${outDir}/${doc.png}  ${kb(`${outDir}/${doc.png}`)} KB`);
  }
} finally {
  await browser.close();
}

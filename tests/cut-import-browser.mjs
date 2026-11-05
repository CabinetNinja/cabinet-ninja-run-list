// Run with PLAYWRIGHT_MODULE pointing to playwright-core and CHROME_PATH to Chromium.
// Optional PDF_FIXTURE / NC_FIXTURE use existing local exports without copying them.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = new URL("../", import.meta.url);
const pdf = process.env.PDF_FIXTURE ? await readFile(process.env.PDF_FIXTURE) : Buffer.from("%PDF-1.7\nfixture");
const nc = process.env.NC_FIXTURE ? await readFile(process.env.NC_FIXTURE) : Buffer.from("%\n(Mozaik fixture)\nG90\nG0X0Y0\nM30\n%");
const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  if (!["/", "/index.html", "/app.js", "/styles.css", "/icon.svg", "/manifest.webmanifest"].includes(path)) { res.writeHead(404).end(); return; }
  let body = await readFile(new URL(path === "/" ? "index.html" : path.slice(1), root));
  if (path === "/" || path === "/index.html") body = body.toString().replace(/<script src="https:[^"]+"><\/script>/, "").replace('<script src="run-list-config.js"></script>', "");
  res.setHeader("Content-Type", path.endsWith(".js") ? "text/javascript" : path.endsWith(".css") ? "text/css" : path.endsWith(".svg") ? "image/svg+xml" : "text/html");
  res.end(body);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: "block" });
  await context.route("**/*", route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${origin}/#/jobform`);
  await page.locator('[name="client_name"]').fill("Regression fixture");
  await page.locator('[name="job_name"]').fill("Folder workflow");
  await page.getByRole("button", { name: "Create job", exact: true }).click();
  await page.waitForURL("**/#/jobs/*");
  const jobId = await page.evaluate(() => state.jobs[0].id);
  await page.evaluate(({ pdf, nc }) => {
    window.fixtureFiles = [new File([new Uint8Array(pdf)], "sheets.pdf"), new File([new Uint8Array(nc)], "16WHMR_S01R01.nc", { type: "text/plain" })];
    const entry = file => ({ kind: "file", getFile: async () => file });
    const directory = (name, entries) => ({ name, kind: "directory", async *entries() { yield* entries; } });
    window.showDirectoryPicker = async () => directory("Fixture folder", [
      ["sheets.pdf", entry(fixtureFiles[0])],
      ["16WHMR", directory("16WHMR", [[fixtureFiles[1].name, entry(fixtureFiles[1])]])],
    ]);
    window.uploads = [];
    dataStore.uploadJobFile = async (path, file) => { uploads.push({ path, type: file.type, bytes: Array.from(new Uint8Array(await file.arrayBuffer())) }); return ""; };
  }, { pdf: [...pdf], nc: [...nc] });
  await page.goto(`${origin}/#/folderimport?job_id=${jobId}`);
  await page.locator("#chooseCustomerFolderButton").click();
  await page.getByRole("button", { name: "Scan customer folder", exact: true }).click();
  await page.waitForURL("**/#/workshop?**");
  const result = await page.evaluate(() => ({ uploads, files: state.job_files.length, revisions: state.cut_pattern_revisions.map(r => ({ pdf: !!r.pdf_file_id, nc: !!r.nc_file_id })) }));
  assert.equal(result.files, 2);
  assert.ok(result.revisions.some(r => r.pdf && r.nc));
  assert.deepEqual(result.uploads.map(u => u.type), ["application/pdf", "application/octet-stream"]);
  assert.deepEqual(result.uploads.map(u => u.bytes), [[...pdf], [...nc]]);
  await page.goto(`${origin}/#/cutimport?job_id=${jobId}`);
  await page.locator("#cutImportForm").waitFor();
  await page.locator('input[name="files"]').setInputFiles([
    { name: "16WHMR_S02R01.pdf", mimeType: "application/pdf", buffer: pdf },
    { name: "16WHMR_S02R01.nc", mimeType: "", buffer: nc },
  ]);
  await page.getByRole("button", { name: "Import files", exact: true }).click();
  await page.waitForURL("**/#/jobs/*");
  const before = await page.evaluate(() => state.cut_pattern_revisions.length);
  page.on("dialog", dialog => dialog.accept(dialog.message() === "Pattern number" ? "S03" : dialog.defaultValue()));
  await page.locator("#manualPatternButton").click();
  assert.equal(await page.evaluate(() => state.cut_pattern_revisions.length), before + 1);
  await page.goto(`${origin}/#/cutimport?job_id=${jobId}`);
  await page.evaluate(id => createManualPatternForJob(id), jobId);
  await page.locator("#cutImportForm").waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.locator("#cutImportForm").isVisible());
  assert.deepEqual(errors, []);
  console.log("PASS: job creation/open, nested folder selection/scan, PDF/NC matching, upload MIME and byte preservation, direct import, manual pattern from job and cut-import route, mobile form; zero console errors.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

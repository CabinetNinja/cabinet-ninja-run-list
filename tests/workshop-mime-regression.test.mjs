import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const context = vm.createContext({ File, TextDecoder, Uint8Array });
vm.runInContext(source.slice(source.indexOf("const JOB_FILE_MAX_BYTES"), source.indexOf("const CUT_PATTERN_STATUS_OPTIONS")) +
  '\nfunction fileExtension(name) { return name.split(".").pop(); }\n' +
  source.slice(source.indexOf("async function normalizeWorkshopFileMime"), source.indexOf("function formatDateTime")), context);

for (const [extension, contents, types, canonical] of [
  ["pdf", "%PDF-1.7\ncut-sheet fixture", ["", "application/octet-stream", "application/pdf"], "application/pdf"],
  ["nc", "%\n(Mozaik fixture)\nN10 G90\nG0X0Y0\nM30\n%", ["", "text/plain", "application/x-netcdf", "application/octet-stream"], "application/octet-stream"],
]) {
  for (const type of types) test(`${extension}: normalizes ${type || "missing MIME"} without changing bytes`, async () => {
    const input = new File([contents], `16WHMR_S01R01.${extension}`, { type, lastModified: 123 });
    const output = await context.normalizeWorkshopFileMime(input);
    context.assertJobFileAllowed(output);
    assert.equal(output.type, canonical);
    assert.equal(output.name, input.name);
    assert.equal(output.lastModified, input.lastModified);
    assert.deepEqual(await output.arrayBuffer(), await input.arrayBuffer());
  });
}

test("normalization fails closed for renamed executables, scripts, binary NC and fake PDFs", async () => {
  for (const [name, bytes] of [
    ["fake.pdf", "not a PDF"], ["fake.nc", "ordinary text"],
    ["fake.nc", "MZ\nG90"], ["fake.nc", "#!/bin/sh\nG90"],
    ["fake.nc", "\x00\nG90"], ["fake.nc", new Uint8Array([255, 254, 71, 57, 48])],
  ]) await assert.rejects(context.normalizeWorkshopFileMime(new File([bytes], name)));
  const oversized = { name: "large.nc", type: "", size: 50 * 1024 * 1024 + 1 };
  await assert.rejects(context.normalizeWorkshopFileMime(oversized), /50 MiB/);
});

test("unrelated extensions and explicit wrong MIME remain rejected", async () => {
  for (const [name, type] of [["file.pdf", "text/html"], ["file.nc", "application/javascript"], ["file.txt", ""], ["file.exe", ""]]) {
    const file = await context.normalizeWorkshopFileMime(new File(["G90"], name, { type }));
    assert.throws(() => context.assertJobFileAllowed(file));
  }
});

test("cut import template renders all fields and extension guidance", () => {
  let listener;
  const app = {};
  const context = vm.createContext({
    app, state: { jobs: [] }, setTitle() {}, labelForJob() {},
    selectField: (label) => label, field: (label) => label, textareaField: (label) => label,
    document: { getElementById: () => ({ addEventListener: (event, handler) => { listener = handler; } }) },
    handleCutImportSubmit() {},
  });
  vm.runInContext(source.slice(source.indexOf("function renderCutImportForm"), source.indexOf("async function handleCutImportSubmit")), context);
  context.renderCutImportForm({ job_id: "test-job" });
  for (const label of ["Job", "Required physical runs", "Material code override", "Material description", "Pattern override", "Revision override", "Import notes", "<code>.nc</code>", "<code>.cnc</code>", "<code>.tap</code>", "<code>.gcode</code>"]) assert.ok(app.innerHTML.includes(label), label);
  assert.equal(listener, context.handleCutImportSubmit);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const collectorStart = appSource.indexOf("function relativePathForCustomerFile(file) {");
const collectorEnd = appSource.indexOf("async function handleFolderImportSubmit(event) {");

function scanContext() {
  assert.notEqual(collectorStart, -1, "customer folder helpers are present");
  assert.notEqual(collectorEnd, -1, "customer folder helpers have a boundary");
  const context = vm.createContext({ customerFolderRelativePaths: new WeakMap() });
  vm.runInContext(appSource.slice(collectorStart, collectorEnd), context);
  return context;
}

function fileEntry(name) {
  return { kind: "file", getFile: async () => ({ name }) };
}

function directoryEntry(entries) {
  return {
    kind: "directory",
    async *entries() {
      yield* entries;
    },
  };
}

test("scans every nested material folder and preserves each relative path", async () => {
  const context = scanContext();
  const root = directoryEntry([
    ["sheets.pdf", fileEntry("sheets.pdf")],
    ["16HMR", directoryEntry([["CabinetA-01.nc", fileEntry("CabinetA-01.nc")]])],
    ["18MMDF", directoryEntry([
      ["nested", directoryEntry([["CabinetB-02.cnc", fileEntry("CabinetB-02.cnc")]])],
    ])],
  ]);

  const files = await context.collectCustomerFolderFiles(root, "Reece Tewhaiti");
  assert.deepEqual(Array.from(files, (file) => file.name), ["sheets.pdf", "CabinetA-01.nc", "CabinetB-02.cnc"]);
  assert.deepEqual(Array.from(files, (file) => context.relativePathForCustomerFile(file)), [
    "Reece Tewhaiti/sheets.pdf",
    "Reece Tewhaiti/16HMR/CabinetA-01.nc",
    "Reece Tewhaiti/18MMDF/nested/CabinetB-02.cnc",
  ]);
});
const pdfChooserStart = appSource.indexOf("function chooseCustomerCutSheetPdf(files) {");
const pdfChooserEnd = appSource.indexOf("async function importMaterialFolderForJob(");

test("accepts a single cut-sheet PDF with any filename", () => {
  assert.notEqual(pdfChooserStart, -1, "cut-sheet chooser is present");
  assert.notEqual(pdfChooserEnd, -1, "cut-sheet chooser has a boundary");
  const context = vm.createContext({
    fileKindForName: (name) => String(name).toLowerCase().endsWith(".pdf") ? "pdf" : "nc",
    relativePathForCustomerFile: (file) => file.path || file.name,
  });
  vm.runInContext(appSource.slice(pdfChooserStart, pdfChooserEnd), context);
  const pdf = { name: "Reece Tewhaiti labels.pdf", path: "Reece Tewhaiti/Reece Tewhaiti labels.pdf" };

  assert.equal(context.chooseCustomerCutSheetPdf([pdf]), pdf);
});

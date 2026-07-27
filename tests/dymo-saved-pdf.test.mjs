import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { File } from "node:buffer";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const helperStart = appSource.indexOf("function sharedCutSheetPdfForJob(jobId) {");
const helperEnd = appSource.indexOf("function renderDymoLabelPrintForm(params = {}) {");

test("selects the saved PDF shared by the most current job patterns", () => {
  assert.notEqual(helperStart, -1, "saved PDF helper is present");
  assert.notEqual(helperEnd, -1, "saved PDF helper has a boundary");
  const state = {
    cut_pattern_revisions: [
      { job_id: "job-1", is_current: true, is_superseded: false, pdf_file_id: "shared-pdf" },
      { job_id: "job-1", is_current: true, is_superseded: false, pdf_file_id: "shared-pdf" },
      { job_id: "job-1", is_current: true, is_superseded: false, pdf_file_id: "other-pdf" },
    ],
    job_files: [
      { id: "shared-pdf", job_id: "job-1", file_kind: "pdf", file_url: "https://files.example/shared.pdf", original_filename: "Cabinet labels.pdf" },
      { id: "other-pdf", job_id: "job-1", file_kind: "pdf", file_url: "https://files.example/other.pdf", original_filename: "Other.pdf" },
    ],
  };
  const context = vm.createContext({ state, jobFileById: (id) => state.job_files.find((file) => file.id === id) });
  vm.runInContext(appSource.slice(helperStart, helperEnd), context);

  assert.equal(context.sharedCutSheetPdfForJob("job-1").id, "shared-pdf");
});

test("loads a saved PDF from private job storage when no public URL is present", async () => {
  let requestedPath = "";
  const context = vm.createContext({
    state: { cut_pattern_revisions: [], job_files: [] },
    jobFileById: () => null,
    fetch: async () => ({ ok: false }),
    dataStore: {
      downloadJobFile: async (path) => {
        requestedPath = path;
        return new Blob(["%PDF-private-file"], { type: "application/pdf" });
      },
    },
    File,
    Blob,
  });
  vm.runInContext(appSource.slice(helperStart, helperEnd), context);

  const file = await context.fileFromStoredJobPdf({
    storage_path: "job-1/cut-sheets/Cabinet labels.pdf",
    original_filename: "Cabinet labels.pdf",
    mime_type: "application/pdf",
  });

  assert.equal(requestedPath, "job-1/cut-sheets/Cabinet labels.pdf");
  assert.equal(file.name, "Cabinet labels.pdf");
  assert.equal(file.type, "application/pdf");
});

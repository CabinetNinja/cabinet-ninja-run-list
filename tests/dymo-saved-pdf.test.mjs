import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

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
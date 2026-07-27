import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const retireStart = appSource.indexOf("function retireLegacySharedPdfPlaceholder(jobItem, sharedPdf) {");
const retireEnd = appSource.indexOf("function chooseCustomerCutSheetPdf(files) {");

function cleanupContext(state) {
  assert.notEqual(retireStart, -1, "legacy cleanup helper is present");
  assert.notEqual(retireEnd, -1, "legacy cleanup helper has a boundary");
  const activity = [];
  const context = vm.createContext({
    state,
    cutPatternById: (id) => state.cut_patterns.find((pattern) => pattern.id === id),
    nowIso: () => "2026-07-27T12:00:00.000Z",
    logActivity: (...args) => activity.push(args),
  });
  vm.runInContext(appSource.slice(retireStart, retireEnd), context);
  return { context, activity };
}

test("retires only a no-cuts UNKNOWN S01 shared-PDF placeholder", () => {
  const state = {
    cut_patterns: [
      { id: "legacy", material_code: "UNKNOWN", pattern_number: "S01", status: "files_incomplete", current_revision_id: "legacy-revision" },
      { id: "actual", material_code: "16WHMR", pattern_number: "S01", status: "ready_for_cnc", current_revision_id: "actual-revision" },
    ],
    cut_pattern_revisions: [
      { id: "legacy-revision", job_id: "job-1", cut_pattern_id: "legacy", pdf_file_id: "pdf-1", nc_file_id: "", is_current: true, is_superseded: false, review_required: true },
      { id: "actual-revision", job_id: "job-1", cut_pattern_id: "actual", pdf_file_id: "pdf-1", nc_file_id: "nc-1", is_current: true, is_superseded: false, review_required: false },
    ],
    cut_runs: [],
    remake_requests: [],
  };
  const { context, activity } = cleanupContext(state);

  assert.equal(context.retireLegacySharedPdfPlaceholder({ id: "job-1" }, { id: "pdf-1", original_filename: "sheets.pdf" }), 1);
  assert.equal(state.cut_pattern_revisions[0].is_superseded, true);
  assert.equal(state.cut_pattern_revisions[0].is_current, false);
  assert.equal(state.cut_patterns[0].status, "superseded");
  assert.equal(state.cut_pattern_revisions[1].is_superseded, false);
  assert.equal(activity.length, 1);
});

test("does not retire a placeholder with a completed cut", () => {
  const state = {
    cut_patterns: [{ id: "legacy", material_code: "UNKNOWN", pattern_number: "S01" }],
    cut_pattern_revisions: [{ id: "legacy-revision", job_id: "job-1", cut_pattern_id: "legacy", pdf_file_id: "pdf-1", nc_file_id: "", is_current: true, is_superseded: false, review_required: true }],
    cut_runs: [{ cut_pattern_revision_id: "legacy-revision" }],
    remake_requests: [],
  };
  const { context } = cleanupContext(state);

  assert.equal(context.retireLegacySharedPdfPlaceholder({ id: "job-1" }, { id: "pdf-1", original_filename: "sheets.pdf" }), 0);
  assert.equal(state.cut_pattern_revisions[0].is_current, true);
});
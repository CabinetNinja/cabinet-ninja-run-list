import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const designSource = readFileSync(new URL("../PHASE-1D-INTERNAL-COMMERCIAL-RECORDS.md", import.meta.url), "utf8");
const foundationSource = readFileSync(new URL("../supabase/migrations/202607240002_role_profile_foundation.sql", import.meta.url), "utf8");

test("job financial records use the existing schema and internal role boundary", () => {
  for (const column of ["job_id", "quote_reference", "invoice_reference", "payment_status", "commercial_notes", "updated_at"]) {
    assert.match(foundationSource, new RegExp(`\\b${column}\\b`));
  }
  assert.match(foundationSource, /owner and office read job financials/);
  assert.match(foundationSource, /owner and office insert job financials/);
  assert.match(foundationSource, /owner and office update job financials/);
  assert.match(foundationSource, /has_cabinet_ninja_role\(array\['owner_admin', 'office'\]/);
  assert.match(appSource, /function canManageCommercialRecords\(\)/);
  assert.match(appSource, /if \(!canManageCommercialRecords\(\)\) return "";/);
  assert.match(appSource, /Only Owner\/Admin or Office may edit commercial records/);
  assert.match(appSource, /Internal only\. These fields are not shared outside the internal team/);
  assert.match(designSource, /No production migration or data action/);
});

test("financial records load optionally without breaking ordinary jobs", () => {
  assert.match(appSource, /optionalFinancialsQuery\(client\.from\("job_financials"\)/);
  assert.match(appSource, /function isMissingFinancialsTableError\(error\)/);
  assert.match(appSource, /financialsTableAvailable = false/);
  assert.match(appSource, /Commercial records require the Phase 1B financials table/);
  assert.match(appSource, /if \(!financialsTableAvailable\) safeState = stripFinancialData\(safeState\)/);
  assert.match(appSource, /job_financials: jobFinancials\.data \|\| \[\]/);
});

test("commercial record saves use job_id and updated_at optimistic concurrency", () => {
  assert.match(appSource, /saveChangedRows\("job_financials", previous\.job_financials, normalized\.job_financials, cleanJobFinancial, "job_id"\)/);
  assert.match(appSource, /\.eq\(keyField, row\[keyField\]\)/);
  assert.match(appSource, /\.eq\("updated_at", previous\.updated_at\)/);
  assert.match(appSource, /Concurrent update detected for \$\{table\}\/\$\{row\[keyField\]\}/);
  assert.match(appSource, /Concurrent create detected for \$\{table\}\/\$\{row\[keyField\]\}/);
  assert.doesNotMatch(appSource, /job_financials.*\.upsert\s*\(/s);
});

test("record-level diffing supports job_financials primary key without changing existing id behaviour", () => {
  const helperStart = appSource.indexOf("function changedRecordRows");
  const helperEnd = appSource.indexOf("function createDataStore", helperStart);
  const context = {};
  vm.runInNewContext(`${appSource.slice(helperStart, helperEnd)}; this.changedRecordRows = changedRecordRows;`, context);

  const changed = context.changedRecordRows(
    [{ job_id: "job-1", value: "old" }, { job_id: "job-2", value: "same" }],
    [{ job_id: "job-1", value: "new" }, { job_id: "job-2", value: "same" }, { job_id: "job-3", value: "new" }],
    ({ job_id, value }) => ({ job_id, value }),
    "job_id",
  );
  assert.deepEqual(changed.map(({ row, previous }) => [row.job_id, previous?.value || null]), [["job-1", "old"], ["job-3", null]]);
});

test("job planning payload remains separate from commercial fields", () => {
  const cleanJobStart = appSource.indexOf("function cleanJob(item, includeCustomerLink = true)");
  const cleanJobEnd = appSource.indexOf("function cleanJobFinancial", cleanJobStart);
  const cleanJobSource = appSource.slice(cleanJobStart, cleanJobEnd);
  assert.doesNotMatch(cleanJobSource, /quote_reference|invoice_reference|payment_status|commercial_notes/);
  assert.match(appSource, /function cleanJobFinancial\(item\)/);
  assert.match(appSource, /quote_reference: item\.quote_reference \|\| null/);
  assert.match(appSource, /invoice_reference: item\.invoice_reference \|\| null/);
  assert.match(appSource, /payment_status: item\.payment_status \|\| null/);
  assert.match(appSource, /commercial_notes: item\.commercial_notes \|\| null/);
});

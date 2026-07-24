import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const constants = appSource.match(/const JOB_NUMBER_PREFIX = "CN";\s*const LEAD_NUMBER_PREFIX = "CNL";\s*const TRACKING_NUMBER_PAD = 4;/)?.[0];
const helpersStart = appSource.indexOf("function nextJobNumber() {");
const helpersEnd = appSource.indexOf("function leadSortValue(");

function numberingContext(state) {
  assert.ok(constants, "tracking number constants are present");
  assert.notEqual(helpersStart, -1, "tracking number helpers are present");
  assert.notEqual(helpersEnd, -1, "tracking number helpers end before lead sorting");

  const context = vm.createContext({ state });
  vm.runInContext(`${constants}\n${appSource.slice(helpersStart, helpersEnd)}`, context);
  return context;
}

test("lead and job numbers share one sequence", () => {
  const context = numberingContext({
    jobs: [{ job_number: "CN-0017" }],
    leads: [{ lead_number: "CNL-0021" }, { lead_number: "not-a-tracking-number" }],
  });

  assert.equal(context.nextLeadNumber(), "CNL-0022");
  assert.equal(context.nextJobNumber(), "CN-0022");
});

test("a converted lead keeps its numeric suffix as a job number", () => {
  const context = numberingContext({ jobs: [], leads: [] });

  assert.equal(context.jobNumberForLead("CNL-0042"), "CN-0042");
  assert.equal(context.jobNumberForLead("unknown"), "CN-0001");
});
test("lead creation and conversion use the stored lead number", () => {
  assert.match(appSource, /lead_number:\s*input\.lead_number\?\.trim\(\)\s*\|\|\s*nextLeadNumber\(\)/);
  assert.match(appSource, /const leadNumber = leadItem\.lead_number \|\| nextLeadNumber\(\);\s*const nextJob = job\(jobNumberForLead\(leadNumber\),/s);
});
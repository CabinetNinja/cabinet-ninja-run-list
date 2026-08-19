import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const designSource = readFileSync(new URL("../PHASE-1F-JOB-ACTIVITY-TIMELINE.md", import.meta.url), "utf8");

test("job detail includes a read-only, job-scoped activity timeline", () => {
  assert.match(appSource, /\$\{renderJobActivityCard\(id\)\}/);
  assert.match(appSource, /function jobActivityFor\(jobId, limit = 8\)/);
  assert.match(appSource, /\.filter\(\(item\) => item\.job_id === jobId\)/);
  assert.match(appSource, /\.sort\(\(a, b\) => \(b\.happened_at \|\| ""\)\.localeCompare\(a\.happened_at \|\| ""\)\)/);
  assert.match(appSource, /\.slice\(0, limit\)/);
  assert.match(appSource, /function renderActivityCard\(activity, emptyMessage, className = "panel", showDetails = false\)/);
  assert.match(appSource, /escapeHtml\(item\.action \|\| "Activity"\)/);
  assert.match(appSource, /renderActivityCard\(activity, "No recent workshop activity for this job\.", "panel workshop-side-card"\)/);
  assert.match(designSource, /no production migration/i);
  assert.match(designSource, /customer portal remains disabled/i);
});

test("job activity timeline excludes other jobs, orders newest first, and caps the result", () => {
  const start = appSource.indexOf("function jobActivityFor");
  const end = appSource.indexOf("function renderActivityCard", start);
  const context = {
    state: {
      activity_history: [
        { id: "old", job_id: "job-1", happened_at: "2026-08-18T09:00:00Z" },
        { id: "other", job_id: "job-2", happened_at: "2026-08-18T12:00:00Z" },
        { id: "new", job_id: "job-1", happened_at: "2026-08-19T09:00:00Z" },
        { id: "middle", job_id: "job-1", happened_at: "2026-08-18T10:00:00Z" },
      ],
    },
  };
  vm.runInNewContext(`${appSource.slice(start, end)}; this.jobActivityFor = jobActivityFor;`, context);

  assert.deepEqual(
    context.jobActivityFor("job-1", 2).map((item) => item.id),
    ["new", "middle"],
  );
});

test("the timeline uses the existing activity-history boundary without adding production schema or portal access", () => {
  assert.match(designSource, /existing internal activity history/i);
  assert.match(designSource, /existing RLS boundary/);
  assert.match(designSource, /no production migration.*Auth change, RLS change, Storage change/i);
  assert.doesNotMatch(designSource, /customer portal enabled/);
});

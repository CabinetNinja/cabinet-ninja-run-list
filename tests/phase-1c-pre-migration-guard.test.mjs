import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

function sourcePattern(pattern) {
  return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

const detectionStart = appSource.indexOf("function isMissingCustomerTableError");
const detectionEnd = appSource.indexOf("function cleanCategory", detectionStart);
const detectionContext = {};
vm.runInNewContext(`${appSource.slice(detectionStart, detectionEnd)}; this.isMissingCustomerTableError = isMissingCustomerTableError; this.isMissingCustomerColumnError = isMissingCustomerColumnError;`, detectionContext);

test("missing customer table and missing customer_id column are detected independently", () => {
  assert.equal(detectionContext.isMissingCustomerTableError({ message: "relation public.customers does not exist" }), true);
  assert.equal(detectionContext.isMissingCustomerColumnError({ message: "column jobs.customer_id does not exist" }), true);
  assert.equal(detectionContext.isMissingCustomerTableError({ message: "column jobs.customer_id does not exist" }), false);
  assert.equal(detectionContext.isMissingCustomerColumnError({ message: "relation public.customers does not exist" }), false);
});

test("pre-migration detection requires both customer table and job link column", () => {
  assert.match(appSource, sourcePattern("optionalCustomerQuery(client.from(\"customers\").select(\"*\").order(\"display_name\"))"));
  assert.match(appSource, sourcePattern("optionalCustomerColumnQuery(client.from(\"jobs\").select(\"id, customer_id\").limit(1))"));
  assert.match(appSource, /return customersTableAvailable && customerLinkColumnAvailable/);
  assert.match(appSource, /Customer features require the Phase 1C migration/);
});

test("customer routes and controls are hard-blocked before migration", () => {
  assert.match(appSource, /isCustomerRoute\(route\) && !customerFeaturesAvailable\(\)/);
  assert.match(appSource, /renderCustomerMigrationBlocked\(\);\s*return;/);
  assert.match(appSource, /data-customer-nav/);
  assert.match(appSource, /canManageCustomerLinks\(\) && customerFeaturesAvailable\(\) \? selectField\("Customer"/);
  assert.match(appSource, /if \(canManageCustomerLinks\(\) && customerFeaturesAvailable\(\)\) changes\.customer_id/);
  assert.match(appSource, /if \(!includeCustomerLink\) delete cleaned\.customer_id/);
});

test("missing migration state cannot leave local customer records or customer link payloads", () => {
  const stripStart = appSource.indexOf("function stripCustomerMigrationData");
  const stripEnd = appSource.indexOf("function createDataStore", stripStart);
  const cleanStart = appSource.indexOf("function cleanJob");
  const cleanEnd = appSource.indexOf("function stripDashboardColumns", cleanStart);
  const context = {};
  vm.runInNewContext(`
    function cloneState(value) { return JSON.parse(JSON.stringify(value)); }
    function pickDefined(input) { return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)); }
    ${appSource.slice(stripStart, stripEnd)}
    ${appSource.slice(cleanStart, cleanEnd)}
    this.stripCustomerMigrationData = stripCustomerMigrationData;
    this.cleanJob = cleanJob;
  `, context);

  const state = {
    customers: [{ id: "customer-1", display_name: "Local only" }],
    jobs: [{ id: "job-1", job_number: "CN-9001", customer_id: "customer-1" }],
  };
  const safeState = context.stripCustomerMigrationData(state);
  assert.equal(safeState.customers.length, 0);
  assert.equal(Object.hasOwn(safeState.jobs[0], "customer_id"), false);
  assert.equal(Object.hasOwn(context.cleanJob(state.jobs[0], false), "customer_id"), false);
  assert.equal(context.cleanJob(state.jobs[0], true).customer_id, "customer-1");
});

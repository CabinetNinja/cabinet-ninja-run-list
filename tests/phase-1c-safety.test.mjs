import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const migrationSource = readFileSync(new URL("../supabase/migrations/202608140001_phase_1c_customer_foundation.sql", import.meta.url), "utf8");
const upgradeSource = readFileSync(new URL("./phase-1c-upgrade.ps1", import.meta.url), "utf8");

test("Customers are discoverable on mobile and dashboard Add Customer opens the customer form", () => {
  assert.match(indexSource, /<a href="#\/customers" data-route="customers" data-customer-nav>/);
  assert.doesNotMatch(indexSource, /<a class="desktop-nav-only" href="#\/customers"/);
  assert.match(stylesSource, /\.bottom-nav\s*\{[\s\S]*?grid-template-columns:\s*repeat\(6,/);
  assert.match(appSource, /<a class="ghost-button" href="#\/customerform">Add Customer<\/a>/);
});

test("Customer and job-link controls are role-aware and the database boundary is explicit", () => {
  assert.match(appSource, /const CUSTOMER_MANAGER_ROLES = new Set\(\["owner_admin", "office"\]\)/);
  assert.match(appSource, /function canManageCustomers\(\)/);
  assert.match(appSource, /function canManageCustomerLinks\(\)/);
  assert.match(appSource, /canManageCustomers\(\) \? '<a class="primary-action" href="#\/customerform">\+ New customer<\/a>'/);
  const detailStart = appSource.indexOf("function renderCustomerDetail(id)");
  const detailEnd = appSource.indexOf("function renderCustomerForm", detailStart);
  const detailSource = appSource.slice(detailStart, detailEnd);
  assert.match(detailSource, /canManageCustomers\(\)\s*\?\s*`[\s\S]*?href="#\/customerform\/\$\{customerItem\.id\}"/);
  assert.match(appSource, /canManageCustomerLinks\(\) && customerFeaturesAvailable\(\) \? selectField\("Customer"/);
  assert.match(appSource, /cleanJob\(row, customerFeaturesAvailable\(\) && canManageCustomerLinks\(\)\)/);
  assert.match(migrationSource, /can_manage_customer_links/);
  assert.match(migrationSource, /jobs_customer_link_boundary/);
  assert.match(migrationSource, /Only Owner\/Admin or Office may change a job customer link/);
  for (const role of ["Workshop", "Install", "Read-only", "Unassigned"]) assert.match(upgradeSource, new RegExp(role));
  assert.match(upgradeSource, /anonJobUpdate/);
});

test("Rejected remote saves remain non-authoritative until reload or deliberate reapply", () => {
  const saveStart = appSource.indexOf("function saveState(nextState = state)");
  const saveEnd = appSource.indexOf("function cloneState", saveStart);
  const saveSource = appSource.slice(saveStart, saveEnd);
  assert.ok(saveSource.indexOf("await dataStore.saveState") < saveSource.indexOf("persistAuthoritativeState(saved)"));
  assert.match(saveSource, /restoreAuthoritativeState\(\)/);
  assert.match(appSource, /Save conflict — reload required/);
  assert.match(appSource, /Your rejected values were not saved as local data/);
  assert.match(appSource, /Reload server data/);
  assert.match(appSource, /Reapply rejected edit/);
  assert.match(appSource, /Resolve the current sync conflict before saving again/);
  assert.match(appSource, /toast\("Job planning saved\."\);[\s\S]*render\(\);/);
});

test("Customer numbering is manual and optional, with duplicate-reference coverage", () => {
  assert.match(appSource, /Manual customer reference \(optional\)/);
  assert.match(appSource, /UUID is the customer identity/);
  assert.doesNotMatch(appSource, /function nextCustomerNumber\(/);
  assert.match(migrationSource, /customer_number text not null default ''/);
  assert.match(migrationSource, /create unique index if not exists customers_customer_number_unique_idx/);
  assert.match(migrationSource, /where customer_number <> ''/);
  assert.match(upgradeSource, /duplicateRejected/);
});

test("Unauthenticated fallback strips customer state and audit fields use the authenticated identity", () => {
  assert.match(appSource, /const safeState = stripCustomerMigrationData\(loadLocalState\(\)\)/);
  assert.match(appSource, /authRequired: true,[\s\S]*state: safeState/);
  assert.match(appSource, /created_by: currentUserId\(\) \|\| null/);
  assert.match(appSource, /updated_by: currentUserId\(\) \|\| item\.updated_by \|\| null/);
  assert.match(migrationSource, /new\.created_by = auth\.uid\(\)/);
  assert.match(migrationSource, /new\.updated_by = auth\.uid\(\)/);
  assert.match(upgradeSource, /ownerAudit/);
});

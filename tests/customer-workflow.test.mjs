import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const migrationSource = fs.readFileSync(new URL("../supabase/migrations/202608140001_phase_1c_customer_foundation.sql", import.meta.url), "utf8");

test("internal customer workflow is present without automatic job backfill", () => {
  for (const marker of [
    "function renderCustomers()",
    "function renderCustomerForm(params = {}, id = null)",
    "function renderCustomerDetail(id)",
    "#/customerform",
    "#/customers/${customerItem.id}",
    'selectField("Customer", "customer_id"',
    "if (canManageCustomerLinks() && customerFeaturesAvailable()) changes.customer_id = values.customer_id || null",
    "function saveRecord(table, row, cleaned, previous)",
    "Concurrent update detected",
  ]) {
    assert.match(appSource, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(migrationSource, /UPDATE\s+public\.jobs\s+SET\s+customer_id/i);
  assert.match(appSource, /Manual customer reference \(optional\)/);
  assert.match(migrationSource, /where customer_number <> ''/i);
});

test("customer foundation keeps the internal-only boundary", () => {
  assert.match(migrationSource, /CREATE TABLE IF NOT EXISTS public\.customers/i);
  assert.match(migrationSource, /CREATE POLICY "internal staff can read customers"/i);
  assert.match(migrationSource, /owner and office create customers/i);
  assert.match(migrationSource, /owner and office update customers/i);
  assert.doesNotMatch(migrationSource, /CREATE POLICY[^;]+DELETE/i);
  assert.match(migrationSource, /customer_id\s+text\s+REFERENCES public\.customers\(id\)/i);
});

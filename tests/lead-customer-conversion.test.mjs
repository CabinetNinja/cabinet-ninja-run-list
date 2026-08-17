import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const migrationSource = readFileSync(new URL("../supabase/migrations/202608170001_lead_customer_conversion.sql", import.meta.url), "utf8");

const helperStart = appSource.indexOf("function canonicalNzPhone");
const helperEnd = appSource.indexOf("function conversionRecordsFromResult", helperStart);
const helperContext = { state: { customers: [] } };
vm.runInNewContext(`
  function cloneState(value) { return JSON.parse(JSON.stringify(value)); }
  ${appSource.slice(helperStart, helperEnd)}
  this.normalizeDuplicateValue = normalizeDuplicateValue;
  this.customerMatchesLead = customerMatchesLead;
  this.findPotentialCustomerMatches = findPotentialCustomerMatches;
`, helperContext);

test("lead detail has a clear, role- and migration-gated conversion action", () => {
  assert.match(appSource, /Convert to customer/);
  assert.match(appSource, /renderLeadConversionForm\(id\)/);
  assert.match(appSource, /!customerFeaturesAvailable\(\) \|\| !leadConversionAvailable/);
  assert.match(appSource, /Only Owner\/Admin or Office may convert a lead/);
  assert.match(appSource, /mobile-lead-conversion-page/);
  assert.match(appSource, /The original lead will be retained/);
});

test("duplicate detection checks email, phone, name, and address", () => {
  const lead = {
    client_name: "Jane Doe",
    phone: "021 555 123",
    email: "Jane@example.com",
    location: "12 Example Road",
  };
  for (const customer of [
    { id: "email", display_name: "Other", email: "jane@example.com" },
    { id: "phone", display_name: "Other", phone: "+64 21 555 123" },
    { id: "name", display_name: "Jane Doe" },
    { id: "address", display_name: "Other", address: "12   Example Road" },
  ]) {
    assert.equal(helperContext.customerMatchesLead(lead, customer), true);
  }
  assert.deepEqual(
    helperContext.findPotentialCustomerMatches(lead, [{ id: "match", display_name: "Jane Doe" }, { id: "no", display_name: "Different" }]).map((item) => item.id),
    ["match"],
  );
});

test("NZ phone duplicate matching canonicalises spaced, dashed, local, and international values", () => {
  const formats = ["021 123 4567", "021-123-4567", "0211234567", "+64 21 123 4567", "0064 21 123 4567"];
  for (const value of formats) {
    assert.equal(helperContext.normalizeDuplicateValue(value, "phone"), "0211234567");
  }
  const lead = { client_name: "Old lead", phone: "021 123 4567" };
  const submittedContact = { display_name: "Old lead", phone: "+64 21 123 4567" };
  assert.equal(
    helperContext.customerMatchesLead(lead, { id: "phone-match", display_name: "Other", phone: "021-123-4567" }, submittedContact),
    true,
  );
  assert.match(migrationSource, /canonical_nz_phone/);
  assert.match(migrationSource, /0064/);
  assert.match(migrationSource, /64%/);
});

test("edited contact values drive duplicate detection and the new job client name", () => {
  const lead = {
    client_name: "Original lead name",
    phone: "021 000 0000",
    email: "original@example.test",
    location: "Original address",
  };
  const editedContact = {
    display_name: "Corrected customer name",
    phone: "+64 21 999 9999",
    email: "corrected@example.test",
    address: "Corrected address",
  };
  const customer = {
    id: "edited-match",
    display_name: "Corrected customer name",
    phone: "021-999-9999",
    email: "corrected@example.test",
    address: "Corrected address",
  };
  assert.equal(helperContext.customerMatchesLead(lead, customer), false);
  assert.equal(helperContext.customerMatchesLead(lead, customer, editedContact), true);
  assert.deepEqual(
    helperContext.findPotentialCustomerMatches(lead, [customer], editedContact).map((item) => item.id),
    ["edited-match"],
  );
  assert.match(appSource, /findPotentialCustomerMatches\(leadItem, state\.customers, submittedContact\)/);
  assert.match(appSource, /customerItem\.display_name \|\| leadItem\.client_name/);
  assert.match(migrationSource, /p_customer_contact->>'email'/);
  assert.match(migrationSource, /p_customer_contact->>'phone'/);
  assert.match(migrationSource, /p_customer_contact->>'display_name'/);
  assert.match(migrationSource, /p_customer_contact->>'address'/);
});

test("conversion keeps customer portal disabled and uses an atomic, retry-safe server boundary", () => {
  assert.match(appSource, /client\.rpc\("convert_lead_to_customer"/);
  assert.match(appSource, /async function completeLeadConversion/);
  assert.match(appSource, /convertLeadInLocalState/);
  assert.match(appSource, /const before = cloneState\(state\)/);
  assert.match(appSource, /state = before/);
  assert.match(migrationSource, /pg_advisory_xact_lock\(hashtextextended\('lead-conversion:'/i);
  assert.match(migrationSource, /v_lead\.customer_id is not null and v_lead\.job_id is not null/);
  assert.match(migrationSource, /'idempotent', v_is_idempotent/);
  assert.match(migrationSource, /converted_at/);
  assert.match(migrationSource, /converted_by/);
  assert.match(migrationSource, /customer_id/);
  assert.match(migrationSource, /job_id/);
  assert.match(migrationSource, /source_lead_id/);
  assert.match(migrationSource, /coalesce\(v_customer\.display_name, nullif\(trim\(v_lead\.client_name\)/);
  assert.doesNotMatch(appSource, /customer portal/i);
});

test("conversion preserves enquiry context and attachment references without moving files", () => {
  for (const marker of ["scope", "budget", "location_details", "notes", "enquiry_attachments", "enquiry_context"]) {
    assert.match(migrationSource, new RegExp(marker));
    assert.match(appSource, new RegExp(marker));
  }
  assert.match(appSource, /Existing file records and paths are referenced, not moved/);
  assert.doesNotMatch(migrationSource, /delete from public\.(leads|jobs|job_files)/i);
  assert.doesNotMatch(migrationSource, /storage\.from|storage\.objects/i);
});

test("conversion is explicit about links, permissions, and original-record retention", () => {
  assert.match(appSource, /link_existing/);
  assert.match(appSource, /create_new/);
  assert.match(appSource, /converted_job_id: nextJob\.id/);
  assert.match(appSource, /customer_id: customerItem\.id/);
  assert.match(appSource, /job_id: nextJob\.id/);
  assert.match(migrationSource, /Only Owner\/Admin or Office may convert a lead/);
  assert.match(migrationSource, /for update/);
  assert.match(migrationSource, /references public\.customers\(id\)/i);
  assert.match(migrationSource, /references public\.leads\(id\)/i);
});

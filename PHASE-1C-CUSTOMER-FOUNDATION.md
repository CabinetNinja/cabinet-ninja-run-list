# Cabinet Ninja Phase 1C customer foundation

Status: customer foundation and lead-conversion migration applied in supervised production. The internal conversion workflow is deployed and verified, but no customer was created and no real lead was converted by the rollout. No customer portal access is enabled.

## Scope

- Add an internal `public.customers` table with contact and lifecycle fields.
- Add nullable `public.jobs.customer_id` with `ON DELETE SET NULL`.
- Preserve every existing job ID, existing `CN-####` number, and existing customer text fields; no backfill is performed.
- Provide an internal customer list, create/edit form, customer detail view, and explicit job linking control.
- Show the linked customer on job lists and job detail views; unlinked jobs remain valid and display no customer.
- Keep `customer_number` optional as a manual reference. Automatic customer-number allocation is formally deferred: UUID is the customer identity, no allocator exists in this phase, and duplicate non-empty references are rejected by the unique partial index.
- Add customer-reference, active-name, and job-customer indexes.
- Restrict customer records to authenticated internal staff through RLS. Internal staff may read; Owner/Admin and Office may insert/update. Only Owner/Admin and Office may write or clear `jobs.customer_id`, enforced by application boundaries and a database trigger. There is no customer DELETE policy and no customer/external role.
- Show customer create/edit controls only to Owner/Admin and Office. The unauthenticated pre-migration fallback strips customer records and customer links from local state and does not expose customer controls.
- Populate `created_by` and `updated_by` from the authenticated user when the server receives customer writes.
- Replace whole-state client upserts with record-level optimistic updates keyed by `id` and the last known `updated_at`. A concurrent update fails closed: rejected values are not persisted as authoritative local state, the server record must be reloaded, and deliberate reapplication is required before another save.
- Require both the `customers` table and `jobs.customer_id` column before exposing customer routes or sending customer-linked job payloads. Before the migration, customer data is not retained locally, customer links are omitted from job writes, and ordinary job workflows remain available with a clear nonfatal status message.

## Lead-to-customer conversion extension

- Applied migration: `supabase/migrations/202608170001_lead_customer_conversion.sql`. Do not re-apply it. The migration history is verified through `202608170001`; the first real lead conversion remains a separate supervised approval for the exact lead and proposed customer/job result.
- The lead detail action is available only after the conversion columns and transaction function are detected, and only to Owner/Admin or Office. Before that migration, the action is hidden and direct conversion attempts fail closed with a nonfatal message; ordinary lead, job, customer, and Run List workflows remain available.
- Conversion preserves the original lead and records `converted_at`, `converted_by`, `customer_id`, `job_id`, and the legacy `converted_job_id`. It creates or links exactly one customer and creates or links exactly one job. Existing legacy `converted_job_id` values are reused rather than creating a second job.
- Duplicate candidates are detected from the submitted conversion-form values using one shared NZ phone rule (punctuation removed and `64`/`0064` normalised to the local `0` prefix) plus normalized email, display name, and address. When candidates exist, the user must explicitly choose `link_existing` or `create_new`.
- The database function serializes retries per lead and wraps customer, job, and lead writes in one transaction. A failed conversion rolls back all writes. The application local fallback uses the same validation and restores its pre-conversion snapshot on failure.
- Scope, budget, location details, notes, and attachment references are copied into job enquiry context. Storage objects and paths are not moved or rewritten. Customer portal access remains disabled.
- For a newly created job, the submitted/linked customer display name is used as `client_name`; the existing lead name remains the job name and the original lead is retained unchanged apart from conversion markers.

## Local implementation

- Migration: `supabase/migrations/202608140001_phase_1c_customer_foundation.sql`
- Application sync: `app.js`
- Upgrade/idempotency/RLS test: `tests/phase-1c-upgrade.ps1`
- Record-level/concurrency test: `tests/concurrency-safe-save.test.mjs`
- Mobile, role-boundary, fallback, audit-field, and duplicate-reference source checks: `tests/phase-1c-safety.test.mjs`
- Customer workflow and no-backfill test: `tests/customer-workflow.test.mjs`
- Pre-migration hard-block and payload test: `tests/phase-1c-pre-migration-guard.test.mjs`

## Verification

- The Phase 1C local upgrade test is the required verification for additive schema, nullable link, indexes, internal-only RLS, no customer DELETE policy, no anonymous privilege, role-bound linking, audit fields, idempotent rerun, and preservation of existing job ID/`CN-####` number.
- The Phase 1B local regression runner remains the regression gate for the completed Phase 1B foundation.
- Node regression checks include the record-level save tests and `tests/phase-1c-safety.test.mjs`.
- Customer portal access remains disabled.
- Conversion coverage includes new customer conversion, existing-customer linking, duplicate detection, retry/idempotency, original-lead preservation, customer/job links, rollback, role denial, and mobile conversion layout checks.
- Local UI syntax, customer workflow, and pre-migration hard-block checks are required before merge; this checkout must report any unavailable Node or Supabase CLI dependency as blocked rather than treating static inspection as a pass.

## Production closeout

The supervised `202608170001` rollout was verified without creating customer data or converting a lead:

- Migration history is complete through `202608170001`; no later migration was applied.
- Existing counts remain 7 leads, 0 customers, and 12 jobs, with 0 non-null customer links and 0 populated new conversion fields.
- Existing job IDs and `CN-####` values remain preserved with no duplicate CN numbers.
- The protected `job-files` Storage inventory remains 22 objects / 9,451,630 bytes, private, with its pre-cutover object metadata unchanged.
- The conversion function is security-invoker, uses the shared canonical NZ phone function, serializes retries, and remains restricted by the internal customer-link role boundary.
- The customer portal, invitations, external access, and first real lead conversion remain disabled or separately gated.

## Review gate

Review customer field semantics, role visibility, customer-number generation, job-form linking, and the production conversion evidence in the draft PR. Add staff only after the record-level update path is accepted. The migration gate is complete; the next production gate is Adam's explicit approval for one named real lead and the proposed customer/job result. No bulk conversion or automatic backfill is permitted.

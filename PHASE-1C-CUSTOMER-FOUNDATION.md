# Cabinet Ninja Phase 1C customer foundation

Status: local implementation only. No Phase 1C migration has been applied to production, and no customer portal access is enabled.

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
- Local UI syntax, customer workflow, and pre-migration hard-block checks are required before merge; this checkout must report any unavailable Node or Supabase CLI dependency as blocked rather than treating static inspection as a pass.

## Review gate

Review customer field semantics, role visibility, customer-number generation, job-form linking, and the production rollout/rollback plan in the draft PR. Add staff only after the record-level update path is accepted. Production migration remains a separate supervised step after review and approval.

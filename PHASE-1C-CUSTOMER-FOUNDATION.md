# Cabinet Ninja Phase 1C customer foundation

Status: local implementation only. No Phase 1C migration has been applied to production, and no customer portal access is enabled.

## Scope

- Add an internal `public.customers` table with contact and lifecycle fields.
- Add nullable `public.jobs.customer_id` with `ON DELETE SET NULL`.
- Preserve every existing job ID, existing `CN-####` number, and existing customer text fields; no backfill is performed.
- Provide an internal customer list, create/edit form, customer detail view, and explicit job linking control.
- Show the linked customer on job lists and job detail views; unlinked jobs remain valid and display no customer.
- Add customer-number, active-name, and job-customer indexes.
- Restrict customer records to authenticated internal staff through RLS. Internal staff may read; Owner/Admin and Office may insert/update. There is no customer DELETE policy and no customer/external role.
- Replace whole-state client upserts with record-level optimistic updates keyed by `id` and the last known `updated_at`. A concurrent update fails closed and requires a reload instead of overwriting another session.
- Require both the `customers` table and `jobs.customer_id` column before exposing customer routes or sending customer-linked job payloads. Before the migration, customer data is not retained locally, customer links are omitted from job writes, and ordinary job workflows remain available with a clear nonfatal status message.

## Local implementation

- Migration: `supabase/migrations/202608140001_phase_1c_customer_foundation.sql`
- Application sync: `app.js`
- Upgrade/idempotency/RLS test: `tests/phase-1c-upgrade.ps1`
- Record-level/concurrency test: `tests/concurrency-safe-save.test.mjs`
- Customer workflow and no-backfill test: `tests/customer-workflow.test.mjs`
- Pre-migration hard-block and payload test: `tests/phase-1c-pre-migration-guard.test.mjs`

## Verification

- Phase 1C local upgrade test passed: additive schema, nullable link, three indexes, internal-only RLS, no customer DELETE policy, no anonymous privilege, role boundary checks, idempotent rerun, and preservation of existing job ID/`CN-####` number.
- Phase 1B local regression runner passed: 40 permission checks and fixed 900-second signed-URL checks.
- Node regression checks passed, including the new record-level save tests.
- Customer portal access remains disabled.
- Local UI syntax and customer workflow checks passed.
- Pre-migration hard-block checks passed for missing table/column detection, direct-route blocking, local-state protection, and customer-link payload omission.

## Review gate

Review customer field semantics, role visibility, customer-number generation, job-form linking, and the production rollout/rollback plan in the draft PR. Add staff only after the record-level update path is accepted. Production migration remains a separate supervised step after review and approval.

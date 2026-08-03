# Phase 1B security foundation

## What is implemented locally

- Internal roles: owner_admin, office, workshop, install, and read_only.
- staff_profiles for one active role per authenticated user, and job_assignments for responsibility, filters, and notifications. Assignments do not hide active jobs from Workshop or Install.
- Security-definer helper functions with fixed search paths; they read only role/active-job facts and do not execute user-controlled SQL.
- Replacement RLS policies: no unassigned user can read business data; Office and Owner/Admin can work with all records; Workshop/Install have operational reads and writes; Read-only has operational reads only. Client DELETE is denied for every role.
- A new private job-files configuration: 50 MiB maximum, documented allow-list, job path convention jobs/<job-id>/<opaque-file-name>, RLS Storage policies, and an Edge Function that creates 60-second signed URLs only after caller authorisation.
- The verified dashboard drift repair as its own idempotent migration.

## Financial-data limitation

The verified production schema has no price, cost, margin, or payment columns. Phase 1B adds the separately protected job_financials table for future commercial fields without moving or inventing production data. jobs.status does include invoice/payment workflow labels, so it is not a suitable long-term financial boundary. Before that status is treated as financial data, split it into operational and commercial fields or expose role-specific server-side projections; RLS alone cannot hide a column from two application roles sharing the authenticated Postgres role.

## Role assignment procedure for production

1. Adam signs in through the normal Auth flow so a real auth.users ID exists. Do not put an email address or UUID in a migration.
2. During the approved deployment window, a trusted database administrator verifies Adam's identity out of band and inserts the first active staff_profiles row with role owner_admin, recording the operator in created_by where available.
3. The administrator verifies the row using current_cabinet_ninja_role() in Adam's authenticated session.
4. Adam assigns future Office users through the approved Owner/Admin workflow. Workshop, Install, and Read-only remain unassigned until needed.
5. Role changes, deactivation, and any break-glass access are recorded in an immutable operational log before a future UI is added.

## File rules and compatibility

New private paths use jobs/<job-id>/<opaque-file-name>. Existing production paths and public URLs are not renamed, deleted, or changed by these migrations. The signed-URL function accepts a job_files ID rather than a path, resolves its job server-side, checks the caller's role, and creates a 60-second URL with the service role held only in Edge Function environment variables.

The bucket allow-list permits normal images, PDFs, TXT/CSV, Word/Excel, and common CAD MIME values. Generic application/octet-stream is deliberately rejected: a browser that cannot identify a CAD file must be handled by a reviewed MIME/extension change rather than silently widening the bucket. The browser also rejects executable, script, archive, and unsafe filename extensions before upload.

## Production sequence and rollback

1. Review this branch and deploy compatibility code and the signed-URL Edge Function, without changing bucket privacy.
2. Verify existing public-path and authenticated-download behaviour; back up and hash the file inventory outside the application.
3. Apply the role foundation, RLS, and dashboard migrations in a controlled window; assign Adam as the first Owner/Admin; run the permission matrix against a non-production project first.
4. Adam approves an after-hours window. Enable the private Storage migration, verify signed URLs and uploads, and keep existing objects/paths intact.
5. Roll back before the file cutover by restoring the prior Storage policies and public bucket flag. The role/data migrations are additive; policy rollback is a separate reviewed SQL script. Do not automatically drop roles, profiles, archive metadata, or files.

## Local verification

The source-controlled local runner is tests/run-phase-1b-local.ps1. It explicitly resets the local Docker project only, seeds the production-shape fixture, applies migrations 202607240002 through 202607240005 directly to that local database, verifies the seven dashboard fields and three missing production indexes, then runs the role, Storage, and Edge Function checks. It never uses a linked project or a remote database command.

supabase/config.toml deliberately disables automatic local migration application. This is only so the local seed can first recreate the verified production shape while the historical 202607240001 no-op marker remains faithful to the remote ledger; the runner applies the Phase 1B migrations in order afterward. This configuration is test scaffolding, not a production deployment configuration.

Verified locally on 2026-08-03:

- 26 database and Storage policy checks passed, covering every internal role, no-role access, permanent-delete denial, scoped private object listing/upload, and unsafe legacy paths.
- Edge Function checks passed: no token returns 401; an unassigned authenticated user returns 403; an authorised Workshop user receives a signed URL with a 60-second expiration. No file contents were read or displayed.
- Node regression suite: 14 passed, 0 failed (including private-file validation).
- Existing Vitest login-containment check: 1 passed, 0 failed.

## Remaining decisions

- Approve the financial-record table/projection design before financial fields are introduced.
- Approve the eventual Owner/Admin confirmation/audit workflow for permanent deletion. Phase 1B intentionally provides no client hard-delete path.
- Confirm CAD MIME values and whether additional Office/image formats are genuinely needed.
- Approve the production backup evidence, file-inventory validation, after-hours cutover owner, and explicit rollback authority.

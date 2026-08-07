# Phase 1B security foundation

## What is implemented locally

- Internal roles: owner_admin, office, workshop, install, and read_only.
- staff_profiles for one active role per authenticated user, and job_assignments for responsibility, filtering, and notifications. Assignments do not hide active jobs from Workshop or Install.
- Security-definer helper functions with fixed search paths.
- Replacement RLS policies: no unassigned user can read business data; Office and Owner/Admin can work with all records; Workshop/Install have operational reads and writes; Read-only has operational reads only. Client DELETE is denied for every role.
- A private job-files configuration with a 50 MiB maximum, exact allow-list, job path convention jobs/<job-id>/<opaque-file-name>, RLS Storage policies, and an Edge Function that creates fixed 15-minute signed URLs only after caller authorisation.
- The verified dashboard drift repair as its own idempotent migration.

## Financial-data limitation

The verified production schema has no price, cost, margin, or payment columns. Phase 1B adds the separately protected job_financials table for future commercial fields without moving or inventing production data. jobs.status includes invoice/payment workflow labels, so it is not a suitable long-term financial boundary. Before that status is treated as financial data, split it into operational and commercial fields or expose role-specific server-side projections; RLS alone cannot hide a column from two application roles sharing the authenticated Postgres role.

## Fail-closed Owner/Admin bootstrap

1. Adam signs in through the normal Auth flow so a real auth.users ID exists. Do not put an email address or UUID in a migration.
2. During the approved deployment window, a trusted database administrator supplies Adam's existing Auth UUID to supabase/production/bootstrap-owner-admin.sql. The script verifies that the UUID exists, assigns owner_admin, and verifies authenticated access to jobs, items, and job_files.
3. Migration 202607240003 refuses to replace unrestricted policies unless an active owner_admin row already exists. If bootstrap or verification fails, the migration stops before dropping any legacy policy.
4. Adam assigns Connie office separately once her real Auth UUID is known. Workshop, Install, and Read-only remain unassigned until needed.
5. Role changes, deactivation, and any break-glass access are recorded in an immutable operational log before a future UI is added. The administrator-only emergency-recovery-restore-access.sql script is the tested recovery path; it requires explicit confirmation and temporarily widens access.

## File rules and compatibility

New private paths use jobs/<job-id>/<opaque-file-name>. Existing production paths and public URLs are not renamed, deleted, or changed by these migrations. The signed-URL function accepts a job_files ID rather than a path, resolves its job server-side, checks the caller's role, and creates a fixed 15-minute URL with the service role held only in Edge Function environment variables. Browser-supplied expiry values are ignored. Both new paths and legacy paths stored in job_files.storage_path use this boundary after the bucket is private; legacy public URLs remain a fallback until cutover verification.

The exact browser extension allow-list is .jpg, .jpeg, .png, .webp, .heic, .pdf, .txt, .csv, .doc, .docx, .xls, .xlsx, .dxf, and .dwg. The exact Storage MIME allow-list is image/jpeg, image/png, image/webp, image/heic, application/pdf, text/plain, text/csv, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/dxf, application/acad, and application/x-dwg. Generic application/octet-stream is rejected.

.nc, .cnc, .tap, and .gcode are folder-scan references only; the current workflow stores their filename/version metadata and does not upload or execute their contents. STEP/STP, IGES/IGS, STL, OBJ, SVG, ZIP/RAR/7Z, HTML, scripts, and executables are not supported. Renaming a common PE, ELF, Mach-O, or shebang script to an allowed extension is rejected by content-signature checks as well as extension/MIME checks. These checks are not antivirus scanning; any new Cabinet Ninja/Mozaik format requires Adam's explicit review.

Retention is at least seven years after job completion, followed by manual Owner/Admin review. No automatic deletion is implemented.

## Production sequence and rollback

Follow PHASE-1B-DEPLOYMENT-RUNBOOK.md with explicit STOP/GO approvals. The short order is: read-only preflight and backup evidence; apply the role foundation; bootstrap and verify Adam; deploy compatibility code and the Edge Function; apply restrictive RLS; repair dashboard drift; verify file access; obtain Adam's supervised after-hours approval; make the bucket private; verify new and legacy file paths; then make the final GO/rollback decision.

Before the file cutover, restore the prior Storage policies and public bucket flag if verification fails. After cutover, use the administrator recovery script for an access incident and restore least privilege from reviewed migrations. Do not automatically drop roles, profiles, archive metadata, or files.

## Local verification

The source-controlled local runner is tests/run-phase-1b-local.ps1. It resets the local Docker project only, seeds the production-shape fixture, bootstraps a synthetic Owner/Admin before restrictive RLS, applies migrations 202607240002 through 202607240005, verifies the seven dashboard fields and three missing production indexes, then runs the role, Storage, and Edge Function checks. It never uses a linked project or remote database command.

tests/phase-1b-upgrade.ps1 exercises an existing production-shaped record set and reruns only migrations designed to be idempotent. tests/phase-1b-bootstrap.ps1 tests the pre-bootstrap STOP gate, explicit UUID validation, authenticated Owner/Admin verification, and administrator recovery.

supabase/config.toml deliberately disables automatic local migration application. This is test scaffolding so the local seed can recreate the verified production shape while the historical 202607240001 no-op marker remains faithful to the remote ledger; the runner applies Phase 1B migrations in order afterward.

Verified locally:

- 26 database and Storage policy checks passed.
- Edge Function checks passed: no token returns 401; an unassigned authenticated user returns 403; an authorised Workshop user receives a fixed 900-second (15-minute) URL even when the browser supplies expiresIn: 999999.
- Bootstrap/recovery checks passed: restrictive RLS stops before policy removal without an Owner/Admin; valid explicit UUID bootstrap succeeds; invalid UUID bootstrap exits nonzero without a role row; administrator recovery restores the emergency path.
- Storage rollback script passed locally: explicit confirmation restored the public flag and legacy policies without moving or deleting objects.
- Upgrade checks passed: existing IDs, CN-####/CNL-#### numbers, file metadata, and paths were preserved; no unassigned roles were created; seven fields and three indexes were created once; safe reruns left two intended Storage policies and a private 50 MiB bucket.
- Node regression suite: 17 passed, 0 failed.
- Existing Vitest login-containment check: 1 passed, 0 failed.

## Approved decisions and remaining gates

Adam is assigned owner_admin. Connie may receive office separately once her Auth UUID exists. Workshop and Install see active jobs, while assignments control responsibility, filtering, and notifications. Workshop, Install, and Read-only do not access financial information. Normal users archive; only Owner/Admin may permanently delete through an explicitly confirmed administrative process. Job files become private, retention is at least seven years with manual review and no automatic deletion, customer access remains out of scope, and the Storage cutover requires Adam's supervised after-hours approval.

Remaining gates are the exact backup evidence, file inventory/hash verification, after-hours owner, and explicit final GO for the private-bucket cutover.

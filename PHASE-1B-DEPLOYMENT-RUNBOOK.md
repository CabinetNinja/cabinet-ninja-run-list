# Cabinet Ninja Phase 1B production deployment runbook

This runbook contains the controlled production procedure and the completed execution record below. The procedure is not authority for any future production change; obtain a new scoped approval before reusing it.

## Completed execution record — 2026-08-14

Evidence capture timestamp: `2026-08-14T15:55:29+12:00` (Pacific/Auckland). Adam accepted the Free-plan/no-PITR manual-backup risk, approved the current NZ-time cutover window, named himself rollback operator, and gave `Final production GO: Yes`.

- Project verified: `xoyzmjbjbaknvgtoofar`.
- `202607240003_replace_unrestricted_rls.sql` applied successfully. Owner/Admin access passed; unassigned access was denied; client DELETE privileges were absent; approved CNC role boundaries and RLS passed.
- `202607240004_dashboard_schema_drift_repair.sql` applied successfully. Seven dashboard columns, three indexes, and `leads.priority NOT NULL` verified.
- Permission, upgrade/idempotency, PWA, Node (19/19), login-containment (1/1), and fixed 900-second signed-URL checks passed before private Storage.
- `202607240005_private_job_files.sql` applied successfully only after those checks. `job-files` is private; intended Storage policy count is two; Storage DELETE policy count is zero; legacy policies are absent.
- Post-cutover inventory is unchanged: 22 objects, `9,451,630` bytes, 12 `.nc` files and 10 PDFs; no path or object mutation occurred. Backup manifest SHA-256: `2582D15385ACD9BD2FEA7D1A83561668038C4C7E462C4E1D4D7F7F1971138D2E`.
- Live authenticated Workshop smoke passed for Run List data, one PDF, and one `.nc` CNC file. No rollback was required; Adam remains rollback operator and restoration owner.

## Required access and prerequisites

- Supabase project-owner or equivalent deployment access for project xoyzmjbjbaknvgtoofar.
- A separately verified database connection or SQL Editor session with permission to run migrations and the administrator recovery scripts.
- The existing Auth UUID for Adam, supplied at execution time as ADAM_AUTH_USER_UUID. Do not place it in source, shell history, or a migration.
- A normal application login for Adam after bootstrap. Connie's Auth UUID is optional and is assigned separately.
- A tested encrypted backup/PITR restore point covering public schema, Storage metadata, and the job-files object inventory. Record backup ID, timestamp, retention, and restore owner in the change record. Database dumps do not contain Storage file contents.
- A supervised after-hours window and a named rollback operator. Customer access remains disabled.

Required environment placeholders:

    PROJECT_REF=xoyzmjbjbaknvgtoofar
    DATABASE_URL=<approved production connection string>
    ADAM_AUTH_USER_UUID=<existing Auth UUID supplied out of band>

Never substitute a real credential or user value into a committed file.

## STOP 1 — read-only preflight

From the reviewed branch, verify the project target and migration plan:

    supabase link --project-ref $PROJECT_REF
    supabase migration list --linked
    supabase db push --linked --dry-run

The only applied remote migration before this change must be 202607240001. The dry run must list 202607240002 through 202607240005 and nothing unexpected. If the target, history, or dry run differs, STOP. Do not run migration repair.

Create a new schema-only evidence file outside the repository:

    supabase db dump --linked --schema public,storage --file <secured-preflight-path>

Run the catalog checks in the Phase 1A audit again without selecting business rows or Storage object names. Confirm RLS status, unrestricted policy count, job-files public flag, and the three dashboard indexes are still the documented production state.

GO only when Adam accepts the preflight evidence.

## STOP 2 — backup confirmation

Confirm the encrypted backup/PITR point, object inventory/hash evidence, and restore owner in the change record. The protected Storage backup must include all 12 existing `.nc` files unchanged, at their exact production paths, with a SHA-256 hash recorded for each file; keep that backup outside Git and outside this repository. The backup must predate any migration or bucket-policy command. If backup evidence is missing or cannot be restored, STOP.

## Stage A — role foundation

The first push is intentionally expected to stop at the fail-closed guard after applying 202607240002:

    supabase db push --linked --yes

Confirm that 202607240002 is recorded and 202607240003 is not recorded. The failure must state that an active Owner/Admin bootstrap is required. If any restrictive policy was removed, STOP and use the administrator recovery path.

Migration 202607240002 is additive and PostgreSQL-transactional. It creates role/profile/assignment/financial structures, helper functions, and archival columns. It does not assign any user.

## Stage B — Adam bootstrap

Run only from the approved administrator session:

    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v adam_auth_user_uuid="$ADAM_AUTH_USER_UUID" -f supabase/production/bootstrap-owner-admin.sql

The script must verify the supplied UUID exists, assign owner_admin, verify the authenticated role path, and read jobs, items, and job_files successfully. A missing or invalid UUID must exit nonzero and leave no role row. Never assume the first Auth user is Adam.

Verify the bootstrap result without exposing the UUID:

    select role, active from public.staff_profiles where role = 'owner_admin' and active = true;

STOP if the result is not exactly the approved active Owner/Admin state.

## Stage C — compatibility and Edge Function

Deploy the reviewed browser compatibility code and the job-file-url Edge Function before restrictive RLS or private Storage:

    supabase functions deploy job-file-url --project-ref "$PROJECT_REF"

Confirm the function's server-only environment contains the service-role secret through the platform secret configuration. Do not print or commit it. Smoke test only with a real authenticated Adam session after the schema is ready; the browser may supply a file ID but cannot supply an expiry.

## Stage D — restrictive RLS and dashboard repair

Re-run the pending migration command:

    supabase db push --linked --yes

This applies 202607240003 and 202607240004, then reaches the final private-file migration. Migrations 202607240003 and 202607240004 are PostgreSQL-transactional. The 202607240003 guard is retained even after bootstrap so an accidental order or wrong project stops before policy replacement.

Before accepting the final command, confirm:

- Adam can read required operational records through the application.
- Unassigned authenticated users cannot read business rows.
- Workshop and Install can read active jobs but cannot read job_financials.
- Read-only can read operational data but cannot write.
- No client DELETE privilege or policy exists.
- The seven dashboard fields and three indexes exist exactly once.

If the command fails before the private bucket migration commits, stop and investigate. Do not repair migration history.

## STOP 3 — supervised private Storage cutover

Migration 202607240005 makes the existing job-files bucket private, sets the 50 MiB limit and exact MIME allow-list, and replaces the old Storage policies. The allow-list includes `application/octet-stream` only for explicit `.nc` paths authorised to Owner/Admin or Workshop; generic octet-stream remains blocked. It does not move, rename, download, or delete objects. Existing public URLs may stop working at commit, so the compatibility code and Edge Function must already be live.

Proceed only inside Adam's explicitly approved after-hours window. Before GO, verify:

- A representative legacy job_files.storage_path and a new jobs/<job-id>/ path are known without exposing file contents.
- The signed-URL function returns a fixed 900-second URL for Adam and denies an unassigned user.
- A small approved PDF/image upload succeeds; Owner/Admin and Workshop can upload a test `.nc`; Office, Install, and Read-only cannot read or upload `.nc`; executable headers, unsafe extensions, and generic octet-stream files with non-`.nc` extensions fail.
- At least one existing `.nc` object opens through a 900-second signed URL without renaming or moving its legacy path.
- The seven-year retention register and manual review owner are recorded.

GO to commit 202607240005 only when Adam approves the cutover.

## Post-deployment verification

Run migration history and schema checks:

    supabase migration list --linked

Expected history is 202607240001 through 202607240005 in order. Verify, without reading business rows or file contents:

    select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'job-files';
    select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' order by policyname;
    select indexname from pg_indexes where schemaname = 'public' and indexname in ('leads_next_action_due_idx','jobs_next_action_due_idx','jobs_target_install_date_idx');

Application smoke tests:

1. Adam signs in and opens the existing Office/Workshop flows.
2. Existing jobs, CN-#### numbers, run-list items, checklists, and suppliers are visible and unchanged.
3. Adam opens one legacy file path and one new private path through the signed-url control.
4. A Workshop user opens an active PDF and an existing `.nc` production file, while Office, Install, Read-only, and unassigned users are denied the `.nc` path and cannot access financial data.
5. A Read-only user can view permitted metadata but cannot upload or modify.
6. An unassigned authenticated user is denied business rows and files.
7. No Customer, Jobs, Dashboard, or customer-portal interface is enabled by this change.

## Rollback decision points

- Before 202607240003: stop the migration command. The bootstrap guard leaves legacy policies in place.
- After 202607240003/004 but before private Storage: use the administrator recovery script only for a verified access incident; otherwise investigate without changing remote history.
- If the private cutover itself must be reversed: after Adam's explicit incident decision, run supabase/production/rollback-private-job-files.sql with confirm_storage_rollback=YES. It restores public bucket behavior and legacy object policies without moving or deleting objects.
- After private cutover: do not delete files or downgrade retention. Use the recovery script for access restoration, then reapply reviewed least-privilege policies and document the incident.
- A backup restore is the final recovery option and must be rehearsed against a non-production target before production use.

## Transaction and irreversibility summary

Migrations 202607240002, 202607240003, and 202607240004 use transactional PostgreSQL DDL and policy changes. Migration 202607240005 changes Storage metadata and policies transactionally, but its commit changes how existing public URLs behave; that external effect is not an automatic rollback guarantee. No migration deletes or moves an object. Recovery scripts are explicit, administrator-only, and never automatic.

## Final GO checklist

- [ ] Correct project and remote history verified.
- [ ] Schema-only preflight retained securely.
- [ ] Backup/PITR and object inventory evidence accepted.
- [ ] Adam's existing Auth UUID verified out of band.
- [ ] Owner/Admin bootstrap succeeded and authenticated record checks passed.
- [ ] Compatibility app and Edge Function deployed and smoke-tested.
- [ ] Restrictive RLS and dashboard drift verified.
- [ ] Adam approved the supervised after-hours private Storage cutover.
- [ ] New and legacy file access verified.
- [ ] Retention, rollback owner, and seven-year review record created.
- [ ] Final migration history and application smoke tests passed.

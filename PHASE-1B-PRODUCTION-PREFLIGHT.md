# Cabinet Ninja Phase 1B production preflight

## Scope and safety

Preflight date: 2026-08-12. This report records release evidence and the supervised after-hours partial cutover. Migration `202607240002`, Adam's Owner/Admin bootstrap, and the reviewed Edge Function deployment were performed against the verified project. Restrictive RLS, dashboard repair, private Storage, invitations, and email were not performed. Approved database dumps and a protected read-only Storage backup were taken.

Repository: `CabinetNinja/cabinet-ninja-run-list`
Branch: `phase-1b-security-foundation`
Reviewed commit: `37301e3065339872ee7db70ee2fe39666a763c36` (`37301e3`)
Expected base: `origin/main` at `3586f196108c707b241b6ef30f88510d69afc0c3`

## Confirmed facts

### Project and repository

- Supabase CLI project enumeration confirms project `xoyzmjbjbaknvgtoofar`, named `cabinet-ninja-run-list`, region `ap-northeast-2`, PostgreSQL 17.6, status `ACTIVE_HEALTHY`.
- The local Supabase project is linked to `xoyzmjbjbaknvgtoofar` for read-only CLI operations. The repository's local test project ID remains unchanged.
- `origin/main` remains `3586f196`; before this evidence-only publication, the remote Phase 1B branch was at `70d0f4b` and the local reviewed branch is at `37301e3`.

### Remote functions and customer access

- Read-only Supabase CLI function enumeration returns no deployed Edge Functions. The reviewed `job-file-url` function is source-only and has not been deployed.
- The only listed project secret is recorded by name only; its value was not read or retained.
- Source and the Phase 1A baseline contain no customer portal tables, memberships, customer policies, customer invitations, or customer-facing access flags. Customer access remains disabled and out of scope.
- No invitation or email command was run. No invitation or email will be sent during this preflight.

### Auth inventory and restoration ownership

- Existing Auth inventory: one user, `info@cabinetninja.co.nz`.
- Adam confirmed that this is the intended Owner/Admin account.
- No other current internal users are assigned or approved.
- Adam is the restoration owner.
- Adam's Auth UUID is intentionally not written into this repository or report.

### Current read-only production evidence

The 2026-08-07 linked dumps and migration listing confirm:

- Initial remote migration history contained only `202607240001`; after the supervised Stage A cutover, `202607240002` is applied and `202607240003` through `202607240005` remain pending.
- The public schema dump contains 20 public business tables, 40 unrestricted authenticated policies, and the Phase 1A schema/catalog objects.
- `job-files` is public with no size/MIME limit; Storage schema evidence confirms authenticated users can read/list and upload job files.
- Storage metadata contains 20 objects: 12 legitimate Mozaik CNC production `.nc` files with `application/octet-stream` and eight PDFs, totaling 8,356,206 bytes. The `.nc` objects are supported production inputs, not disposable legacy references.
- No Storage file contents were read; only database metadata was dumped.

The complete raw evidence is untracked under `preflight-evidence/2026-08-07-manual-backup/`.

## Release evidence completed

- The requested Phase 1B file-security implementation is unchanged at local commit `37301e3065339872ee7db70ee2fe39666a763c36`; no Phase 1B coding was performed for this evidence pass.
- `.nc` policy: Owner/Admin may read, download, upload and manage; Workshop may read, download and upload; Office, Install, Read-only, unassigned, unauthenticated, and customer/external callers are denied. Generic `application/octet-stream` remains blocked except for an explicit `.nc` path with an authorised Owner/Admin or Workshop role.
- Existing legacy object paths remain unchanged and compatible with the future private-bucket signed-URL path. No production object was moved, renamed, deleted, or overwritten.
- The protected backup was taken read-only through the authenticated Storage API endpoint, not a public URL, and is outside the Git repository at `C:\Users\Adam Ants\Documents\CabinetNinja\Phase1B-Storage-Backup-20260812`.
- Protected backup inventory: 20 objects total, 12 `.nc` files, eight PDFs, and `8,356,206` total bytes.
- Every downloaded object matched its previously recorded content length and response ETag. All 12 `.nc` files are present at their exact bucket-relative paths.
- SHA-256 manifest: `F690F1D0D95D1E1CA563F2ACA6C2817CBC2BA7DEA071CD9A7AA14B3670A79681`.
- The backup directory and manifest are EFS-encrypted with AES-256 for Adam's Windows account. No credentials, tokens, Auth UUIDs, or backup archive were committed.
- A non-production restore/read rehearsal passed for one `.nc` file (`48,595` bytes) and one PDF (`694,355` bytes), with byte-for-byte SHA-256 matches.

No UUID, password, database URL, customer data, or secret value is present in this report.

## Manual backup evidence

The linked project was verified as `xoyzmjbjbaknvgtoofar`. The original 2026-08-07 remote migration ledger showed `202607240001` applied with `202607240002` through `202607240005` pending; the supervised after-hours execution subsequently applied `202607240002` only, and the migration guard stopped before `202607240003`. Using `supabase db dump` only, the following non-empty untracked evidence files were created under `preflight-evidence/2026-08-07-manual-backup/`:

- `roles-only.sql` — SHA-256 `25873CEC56A2CC6514E204F420231777F85C03DA818CAA7090CDCDFA89776ECD`
- `public-schema.sql` — SHA-256 `A7EE7646C6599C3F352826EB9C8E81FBC83592DF37A5D8D7487DFA67168B409F`
- `public-data.sql` — SHA-256 `81A29F5FD4BAAF8F0027B7A482A42E6CC5EF5F087BC8C081568507ADC31415E8`
- `storage-object-metadata.sql` — SHA-256 `6D4CCA62C6B190EA12110C15F41F04EE7F7E535A2EE2AD5BDD6F51FB5C81733C`
- `storage-schema.sql` — SHA-256 `46710D2C00B5984ED066A33D343DA59CF70B313702779AA63DF8F7B34F0F395E`

The public schema/data dump restored successfully into a disposable local PostgreSQL database, which was dropped after verification. The restore contained 20 public tables, 11 jobs with six `CN-####` values (`CN-0042` through `CN-0047`), six leads with two `CNL-####` values (`CNL-0048` through `CNL-0049`), 35 cut patterns, 396 revisions, one job-file metadata row, and a representative `CN-0044` record. Full restore evidence is in `preflight-evidence/2026-08-07-manual-backup/restore-test-results.txt`.

Storage metadata confirms 20 `job-files` objects: 12 legitimate `.nc` production files with `application/octet-stream`, eight PDFs, and 8,356,206 bytes total (approximately 8.36 MB). The bucket is currently public; authenticated users can list/read all job files and upload to the bucket. Database dumps do not back up file contents. The separate protected file backup below preserves all 20 objects, including all 12 `.nc` files, at their exact paths with content SHA-256 hashes.

The project plan/PITR capability is not exposed by the CLI project listing, and no PITR restore point was available in this read-only context. Operationally treat this as **Free-plan/no-PITR until Adam verifies otherwise**. The manual database dump and isolated local PostgreSQL restore are verified, Adam is the named restoration owner, and the protected Storage file restore/read rehearsal is complete. No PITR restore point is claimed.

The protected Storage procedure is documented in `PHASE-1B-STORAGE-BACKUP-PROCEDURE.md`. The separate protected backup is now complete: all 20 objects were downloaded read-only through the authenticated Storage API endpoint, preserving exact paths; all 12 `.nc` files and eight PDFs matched their recorded byte lengths and response ETags; and the protected manifest records SHA-256 hashes for every object. The manifest hash is `F690F1D0D95D1E1CA563F2ACA6C2817CBC2BA7DEA071CD9A7AA14B3670A79681`. A local restore/read rehearsal for one `.nc` and one PDF passed byte-for-byte.

The project remains operationally treated as **Free-plan/no-PITR**: the manual database dump and isolated local PostgreSQL restore are the verified database recovery evidence. The protected Storage backup and local file restore/read rehearsal are now also verified. No PITR restore point was claimed.

## Release validation

- Full local Phase 1B runner passed: migrations `202607240002` through `202607240005`, 40 permission checks, and local Edge Function authorisation/fixed 15-minute signed-URL checks.
- Bootstrap lockout-prevention suite passed: pre-bootstrap STOP, valid Owner/Admin verification, invalid UUID rejection, and administrator recovery.
- Upgrade/idempotency suite passed: existing identities, data, IDs, numbers, and legacy CNC paths preserved; no roles auto-assigned; repeatable migrations stable.
- JavaScript syntax check passed; Node regression suite passed 19/19 tests; Vitest login-containment check passed 1/1 test.

## Adam decisions recorded

- Manual backup/no-PITR accepted.
- After-hours cutover approved for 2026-08-12 from 21:58 NZ time; Adam is the rollback operator.
- Final production GO received.
- These approvals do not override the technical STOP requiring the reviewed browser compatibility release to be live before restrictive RLS/private Storage.

## After-hours execution status — 2026-08-12 21:58 NZ time

- Adam accepted the manual backup/no-PITR decision, named Adam as rollback operator, and gave final production GO.
- Stage A completed: `202607240002_role_profile_foundation.sql` applied successfully. The restrictive RLS migration stopped as designed before changing policies because Owner/Admin bootstrap had not yet occurred.
- Stage B completed: the single confirmed Auth user `info@cabinetninja.co.nz` was verified as Adam's intended Owner/Admin account; the approved bootstrap succeeded and one active Owner/Admin profile was verified. The Auth UUID is not recorded here.
- Stage C completed: the reviewed `job-file-url` Edge Function was deployed to project `xoyzmjbjbaknvgtoofar`.
- STOP before Stage D: the published GitHub Pages app is still serving the older `main` revision and does not contain the signed-URL/private-storage compatibility markers. Restrictive RLS and private Storage must not be applied until the reviewed browser compatibility code is live and smoke-tested.
- No production business data or Storage objects were moved, renamed, deleted, or overwritten. Migrations `202607240003` through `202607240005` remain unapplied.

## Exact STOP/GO points

### STOP — current preflight

STOP. Do not apply `202607240003` through `202607240005` until the reviewed browser compatibility code is live on the published Pages site and smoke-tested. Adam's approval, after-hours window, backup decision, and rollback operator are recorded; the remaining blocker is the missing published compatibility release.

### GO gate before any schema work

GO only after an approved operator, using a verified production connection, confirms:

- project ref is exactly `xoyzmjbjbaknvgtoofar`;
- remote history is exactly `202607240001` and dry-run lists only `202607240002`–`202607240005`;
- current catalog/RLS/Storage state matches the Phase 1A evidence;
- backup/PITR restore point predates all changes, is restorable, and has a named owner;
- Adam's Auth UUID and all internal users are verified; no test account is assigned;
- customer access and invitations remain disabled.

### STOP points during deployment

- Stop before `202607240003` if no verified active Adam Owner/Admin profile exists; legacy policies must remain intact.
- Stop before `202607240005` if compatibility app/Edge Function checks, legacy/new path checks, or after-hours approval are incomplete.
- Stop immediately on any unexpected migration, schema, policy, Auth, Storage, backup, or object-inventory difference.

## Expected production impact of the reviewed migrations

- `202607240002` creates empty role/profile/assignment/financial structures and adds nullable archival metadata. It does not assign users or move existing values.
- `202607240003` changes authenticated access behavior and grants, but does not delete business rows. It is guarded by the active Owner/Admin check.
- `202607240004` adds exactly seven dashboard columns and three indexes with `if not exists`; it does not alter existing IDs or `CN-####`/`CNL-####` values.
- `202607240005` changes the existing `job-files` bucket to private and replaces Storage policies. It allows `application/octet-stream` only for explicit `.nc` paths authorised to Owner/Admin or Workshop; generic octet-stream remains blocked. It does not move, rename, download, or delete objects, but it changes how existing public URLs behave. Existing `.nc` files therefore require signed/authenticated access verification before cutover.

## PWA compatibility assessment

The current PWA can remain usable through the staged order only if the compatible browser code and signed-URL Edge Function are deployed and smoke-tested before restrictive RLS and before the private-bucket change. The PWA is not safe to take directly from the current public/unrestricted production state to private Storage without that staged sequence. Customer access must remain disabled throughout.

## Recommended deployment order

1. Capture this preflight and a fresh schema/catalog/Storage/Auth evidence set.
2. Confirm encrypted backup/PITR restore evidence and named restoration owner.
3. Apply `202607240002` only; verify it records successfully.
4. Bootstrap and authenticate Adam's verified Owner/Admin UUID; verify jobs, items, and job files.
5. Deploy compatible PWA code and the reviewed Edge Function; verify CORS, authentication, fixed 900-second URLs, and service-role isolation.
6. Apply `202607240003`; verify restrictive RLS and denied unassigned access.
7. Apply `202607240004`; verify seven columns and three indexes.
8. Obtain explicit after-hours approval, then apply `202607240005`.
9. Verify representative legacy and new `.nc` paths without exposing file contents, including Owner/Admin and Workshop signed URLs and denial for Office, Install, Read-only, unassigned, and unauthenticated callers; then make the final operational GO decision.

## Rollback decision points

- Before `202607240003`: do not continue; no policy replacement has been authorized.
- Before the private-file commit: restore the prior public bucket/policies if compatibility or access checks fail.
- After private Storage cutover: use the explicit administrator recovery and Storage rollback scripts only under the named incident decision; these scripts do not move or delete objects.
- Any rollback must preserve migration history; do not repair or rewrite the remote ledger.

## Updated recommendation after manual backup

**STOP — release evidence is complete, but the compatibility release is not live.** The manual database backup and isolated schema/data restore succeeded. The protected 20-object Storage backup, all 12 `.nc` hashes, EFS protection, and one-file `.nc`/PDF restore rehearsal also succeeded. Adam's backup decision, after-hours approval, rollback operator, and final GO are recorded; do not apply restrictive RLS/private Storage until the reviewed browser compatibility code is live and smoke-tested.

## Final recommendation

**STOP — production cutover partially executed and safely paused.** The reviewed local commit is `37301e3065339872ee7db70ee2fe39666a763c36`, `origin/main` remains `3586f196108c707b241b6ef30f88510d69afc0c3`, the protected Storage backup is verified, Stage A/Owner/Admin bootstrap and the Edge Function deployment succeeded, and the restrictive/private-file migrations remain unapplied. Adam's final GO is recorded, but the published Pages compatibility release must be completed and smoke-tested before continuing.

# Cabinet Ninja Phase 1B production preflight

## Scope and safety

Preflight close-out date: 2026-08-14. This report records release evidence and the supervised partial cutover. Migration `202607240002`, Adam's Owner/Admin bootstrap, and the reviewed Edge Function deployment were performed against the verified project. Restrictive RLS, dashboard repair, private Storage, invitations, and email were not performed. Approved database dumps and a protected read-only Storage backup were taken.

Repository: `CabinetNinja/cabinet-ninja-run-list`
Branch: `phase-1b-security-foundation`
Reviewed implementation commit: `37301e3065339872ee7db70ee2fe39666a763c36` (`37301e3`)
Published compatibility release: `b22f7cb2f5ca38795f3749a8c8705fdd9ee43a09` (`b22f7cb`)
Current `origin/main`: `b22f7cb2f5ca38795f3749a8c8705fdd9ee43a09`; this was a fast-forward from `3586f196`.

## Confirmed facts

### Project and repository

- Supabase CLI project enumeration confirms project `xoyzmjbjbaknvgtoofar`, named `cabinet-ninja-run-list`, region `ap-northeast-2`, PostgreSQL 17.6, status `ACTIVE_HEALTHY`.
- The local Supabase project is linked to `xoyzmjbjbaknvgtoofar` for read-only CLI operations. The repository's local test project ID remains unchanged.
- `origin/main` is now `b22f7cb`; the `phase-1b-security-foundation` branch also remains at `b22f7cb`. No other branch or tag was pushed during the publication.

### Remote functions and customer access

- Read-only Supabase CLI function enumeration confirms the reviewed `job-file-url` Edge Function is active with JWT verification enabled. No additional Edge Function was deployed during this evidence pass.
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
- Storage metadata now contains 22 objects: 12 legitimate Mozaik CNC production `.nc` files with `application/octet-stream` and 10 PDFs, totaling 9,451,630 bytes. The `.nc` objects are supported production inputs, not disposable legacy references.
- The two objects absent from the original 20-object manifest were identified by metadata before any file contents were read; both are PDFs and are covered by the approved file model.

The complete raw evidence is untracked under `preflight-evidence/2026-08-07-manual-backup/`.

## Release evidence completed

- The requested Phase 1B file-security implementation is unchanged at local commit `37301e3065339872ee7db70ee2fe39666a763c36`; no Phase 1B coding was performed for this evidence pass.
- `.nc` policy: Owner/Admin may read, download, upload and manage; Workshop may read, download and upload; Office, Install, Read-only, unassigned, unauthenticated, and customer/external callers are denied. Generic `application/octet-stream` remains blocked except for an explicit `.nc` path with an authorised Owner/Admin or Workshop role.
- Existing legacy object paths remain unchanged and compatible with the future private-bucket signed-URL path. No production object was moved, renamed, deleted, or overwritten.
- The protected backup was taken read-only through the authenticated Storage API endpoint, not a public URL, and is outside the Git repository at `C:\Users\Adam Ants\Documents\CabinetNinja\Phase1B-Storage-Backup-20260812`.
- Protected backup inventory: 22 objects total, 12 `.nc` files, 10 PDFs, and `9,451,630` total bytes.
- Every downloaded object matched its previously recorded content length and response ETag. All 12 `.nc` files are present at their exact bucket-relative paths.
- Original 20-object SHA-256 manifest: `F690F1D0D95D1E1CA563F2ACA6C2817CBC2BA7DEA071CD9A7AA14B3670A79681`.
- Reconciled 22-object manifest: `2582D15385ACD9BD2FEA7D1A83561668038C4C7E462C4E1D4D7F7F1971138D2E`, stored as `storage-manifest-22.json` with its checksum in `storage-manifest-22.sha256.txt`.
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

Storage metadata confirms 22 `job-files` objects: 12 legitimate `.nc` production files with `application/octet-stream`, 10 PDFs, and 9,451,630 bytes total (approximately 9.45 MB). The bucket is currently public; authenticated users can list/read all job files and upload to the bucket. Database dumps do not back up file contents. The separate protected file backup below preserves all 22 objects, including all 12 `.nc` files, at their exact paths with content SHA-256 hashes.

The project plan/PITR capability is not exposed by the CLI project listing, and no PITR restore point was available in this read-only context. Operationally treat this as **Free-plan/no-PITR until Adam verifies otherwise**. The manual database dump and isolated local PostgreSQL restore are verified, Adam is the named restoration owner, and the protected Storage file restore/read rehearsal is complete. No PITR restore point is claimed.

The protected Storage procedure is documented in `PHASE-1B-STORAGE-BACKUP-PROCEDURE.md`. Metadata reconciliation against the original manifest identified these two additional objects before content download:

- `job_mrlcmjy5_daldo1/CN-0046_SHARED_S01R01_1786155284888_fmsjqqmc8e27wij.pdf` — `547,712` bytes; ETag `"9de07ada0f9c60ce315c73efc85301f0"`; MIME `application/pdf`; created `2026-08-08 02:14:53.651531+00`; updated `2026-08-08 02:14:53.651531+00`.
- `job_msjqp8dl_atm9nl/CN-0050_UNKNOWN_S01R01_1786155356565_fmsjqs5n9yfc4u2.pdf` — `547,712` bytes; ETag `"9de07ada0f9c60ce315c73efc85301f0"`; MIME `application/pdf`; created `2026-08-08 02:16:05.234528+00`; updated `2026-08-08 02:16:05.234528+00`.

Both objects are PDFs, not `.nc` CNC files or another unsupported type. They were then downloaded read-only through authenticated Storage API requests with an Authorization header, preserving exact paths; no public URL was used. The protected backup now contains all 22 objects, including all 12 `.nc` files and 10 PDFs, totaling `9,451,630` bytes. All original 20 objects still match their previously recorded sizes and SHA-256 hashes. The reconciled manifest hash is `2582D15385ACD9BD2FEA7D1A83561668038C4C7E462C4E1D4D7F7F1971138D2E`. A local restore/read rehearsal for one `.nc` and one PDF passed byte-for-byte.

The project remains operationally treated as **Free-plan/no-PITR**: the manual database dump and isolated local PostgreSQL restore are the verified database recovery evidence. The protected Storage backup and local file restore/read rehearsal are now also verified. No PITR restore point was claimed.

## Release validation

- Full local Phase 1B runner passed: migrations `202607240002` through `202607240005`, 40 permission checks, and local Edge Function authorisation/fixed 15-minute signed-URL checks.
- Bootstrap lockout-prevention suite passed: pre-bootstrap STOP, valid Owner/Admin verification, invalid UUID rejection, and administrator recovery.
- Upgrade/idempotency suite passed: existing identities, data, IDs, numbers, and legacy CNC paths preserved; no roles auto-assigned; repeatable migrations stable.
- JavaScript syntax check passed; Node regression suite passed 19/19 tests; Vitest login-containment check passed 1/1 test.

## Adam manual smoke confirmation — 2026-08-14

- Adam manually checked the live Cabinet Ninja app and confirmed that the required production files are good, including the `.nc` CNC production files and PDFs.
- The authenticated file smoke test is treated as complete for this preflight.
- This confirmation validates the compatibility release; it does not authorize migrations, RLS changes, private Storage, Auth changes, or deployment.

## Adam approvals required before production cutover

- The final production status remains **NO-GO** until Adam separately provides all of the following:
  - acceptance of the Free-plan/no-PITR manual-backup risk;
  - an after-hours cutover window in New Zealand time;
  - the rollback operator;
  - explicit `Final production GO: Yes`.
- Earlier after-hours notes remain historical execution evidence only and are not treated as the current final cutover approval for this close-out.

## After-hours execution status — 2026-08-12 21:58 NZ time

- The earlier after-hours execution record is retained as historical evidence; current close-out approval remains pending under the separate approval gate above.
- Stage A completed: `202607240002_role_profile_foundation.sql` applied successfully. The restrictive RLS migration stopped as designed before changing policies because Owner/Admin bootstrap had not yet occurred.
- Stage B completed: the single confirmed Auth user `info@cabinetninja.co.nz` was verified as Adam's intended Owner/Admin account; the approved bootstrap succeeded and one active Owner/Admin profile was verified. The Auth UUID is not recorded here.
- Stage C completed: the reviewed `job-file-url` Edge Function was deployed to project `xoyzmjbjbaknvgtoofar`.
- Stage D completed as the approved application-only step: `main` was fast-forwarded to `b22f7cb`, GitHub Pages published the compatibility release, and read-only live smoke checks confirmed the login form, Run List route, signed-URL markers, legacy `storage_path` handling, and `.nc` compatibility.
- No production business data or Storage objects were moved, renamed, deleted, or overwritten. Migrations `202607240003` through `202607240005` remain unapplied.

## Exact STOP/GO points

### STOP — current preflight

STOP. The compatibility release is live, Adam's manual file smoke confirmation is complete, and the reconciled 22-object backup is verified. This close-out does not authorize `202607240003` through `202607240005`, RLS changes, Storage visibility/policy changes, Auth changes, or any deployment. Wait for the four separate Adam approvals before any private Storage cutover.

### GO gate before any schema work

GO only after Adam provides the four approvals above and an approved operator, using a verified production connection, confirms:

- project ref is exactly `xoyzmjbjbaknvgtoofar`;
- remote history is exactly `202607240001` and dry-run lists only `202607240002`–`202607240005`;
- current catalog/RLS/Storage state matches the Phase 1A evidence;
- backup/PITR restore point predates all changes, is restorable, and has a named owner;
- Adam's Auth UUID and all internal users are verified; no test account is assigned;
- customer access and invitations remain disabled.

The exact production cutover steps, to be performed only after that GO gate, are:

1. Record Adam's Free-plan/no-PITR acceptance, NZ-time cutover window, rollback operator, and explicit `Final production GO: Yes`.
2. Reconfirm project `xoyzmjbjbaknvgtoofar`, published compatibility release `b22f7cb`, the protected 22-object backup, and that only migrations `202607240001` and `202607240002` are applied. Do not reapply `202607240002`.
3. Apply `202607240003` only; verify restrictive role-based access and denied unassigned access. Stop on any unexpected policy or data result.
4. Apply `202607240004` only; verify the seven dashboard columns and three indexes. Stop on any unexpected schema result.
5. At the approved NZ-time window, apply `202607240005` only; verify `job-files` is private, the exact MIME/extension policy is active, and no object paths or contents moved.
6. Run the authenticated compatibility smoke test for legacy and new paths: Owner/Admin and Workshop access to `.nc` and PDFs, denial for Office, Install, Read-only, unassigned, unauthenticated, and customer callers, fixed 900-second signed URLs, and rejection of generic octet-stream files.
7. Record the final production GO/NO-GO decision. If any check fails, stop and use the documented rollback procedure without moving or deleting Storage objects.

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

The compatible browser code and signed-URL Edge Function are live and Adam's manual file smoke confirmation is complete. The PWA still must not be taken directly from the current public/unrestricted production state to private Storage without the separately approved staged sequence. Customer access must remain disabled throughout.

## Production cutover sequence

The exact production cutover steps are listed under the GO gate above. No cutover step is authorized by this close-out. Migration `202607240002` is already applied and must not be reapplied; only `202607240003` through `202607240005` remain candidates for a separately approved future cutover.

## Rollback decision points

- Before `202607240003`: do not continue; no policy replacement has been authorized.
- Before the private-file commit: restore the prior public bucket/policies if compatibility or access checks fail.
- After private Storage cutover: use the explicit administrator recovery and Storage rollback scripts only under the named incident decision; these scripts do not move or delete objects.
- Any rollback must preserve migration history; do not repair or rewrite the remote ledger.

## Updated recommendation after manual backup

**STOP — release evidence is complete; private cutover remains unauthorized.** The manual database backup and isolated schema/data restore succeeded. The protected 22-object Storage backup, all 12 `.nc` hashes, EFS protection, metadata reconciliation, and one-file `.nc`/PDF restore rehearsal are verified. The compatibility release is live at `b22f7cb`, but do not apply restrictive RLS/private Storage or make any further production change without separate approval.

## Final recommendation

**NO-GO — final preflight is closed and production cutover is paused.** The reviewed implementation is `37301e3065339872ee7db70ee2fe39666a763c36`; published `main` is `b22f7cb2f5ca38795f3749a8c8705fdd9ee43a09`; the compatibility release is live; migrations `202607240003` through `202607240005` remain unapplied; `job-files` remains public; Adam's authenticated file smoke confirmation is recorded; and the reconciled 22-object backup is verified. No files or business data were moved. Wait for Adam's four separate approvals before any restrictive RLS or private Storage cutover.

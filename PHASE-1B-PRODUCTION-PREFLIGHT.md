# Cabinet Ninja Phase 1B production preflight

## Scope and safety

Preflight close-out date: 2026-08-14. This report records the controlled Phase 1B production rollout. Migrations `202607240002` through `202607240005`, Adam's Owner/Admin bootstrap, and the reviewed Edge Function deployment were performed against the verified project. No invitations or email were sent.

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

- The final remote migration history contains `202607240001` through `202607240005`; no migration beyond `202607240005` was applied.
- The public schema dump contains 20 public business tables, 40 unrestricted authenticated policies, and the Phase 1A schema/catalog objects.
- `job-files` is private after `202607240005`; Storage policy evidence confirms access is through the approved authenticated role boundary and signed URLs.
- Storage metadata now contains 22 objects: 12 legitimate Mozaik CNC production `.nc` files with `application/octet-stream` and 10 PDFs, totaling 9,451,630 bytes. The `.nc` objects are supported production inputs, not disposable legacy references.
- The two objects absent from the original 20-object manifest were identified by metadata before any file contents were read; both are PDFs and are covered by the approved file model.

The complete raw evidence is untracked under `preflight-evidence/2026-08-07-manual-backup/`.

## Release evidence completed

- The requested Phase 1B file-security implementation is unchanged at local commit `37301e3065339872ee7db70ee2fe39666a763c36`; no Phase 1B coding was performed for this rollout.
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

Storage metadata confirms 22 `job-files` objects: 12 legitimate `.nc` production files with `application/octet-stream`, 10 PDFs, and 9,451,630 bytes total (approximately 9.45 MB). Database dumps do not back up file contents. The separate protected file backup below preserves all 22 objects, including all 12 `.nc` files, at their exact paths with content SHA-256 hashes.

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

## Controlled production rollout — 2026-08-14

Evidence capture timestamp: `2026-08-14T15:55:29+12:00` (Pacific/Auckland). The Supabase CLI migration ledger does not expose a per-row `applied_at` value; this report records the exact evidence-capture timestamp and the ordered CLI results without inventing per-migration timestamps.

### Migration results

- `202607240003_replace_unrestricted_rls.sql`: applied successfully in the authorised order. Corrected production verification passed: Owner/Admin job and job-file reads succeeded; unassigned job and job-file reads were denied; client DELETE privileges on `jobs` and `job_files` were absent; approved CNC read/insert/update policy boundaries were present; RLS was enabled.
- `202607240004_dashboard_schema_drift_repair.sql`: applied successfully. Verification passed: exactly seven dashboard repair columns exist and exactly three dashboard indexes exist; `leads.priority` is `NOT NULL`.
- Full permission, upgrade, PWA, and signed-URL regression checks passed before private Storage: 40 permission checks, upgrade/idempotency checks, 19/19 Node tests, 1/1 login-containment test, and fixed 900-second signed-URL checks.
- `202607240005_private_job_files.sql`: applied successfully only after the preceding checks passed. Verification passed: `job-files` is private; the intended two Storage policies are present; Storage DELETE policy count is zero; legacy policies are absent; the 50 MiB bucket limit and approved MIME model are present.

### Post-cutover verification

- Storage inventory remained exactly 22 objects and `9,451,630` bytes. Missing paths: 0. Extra paths: 0. Size mismatches: 0. No file was moved, renamed, deleted, overwritten, or re-uploaded.
- All 12 `.nc` paths remain unchanged and compatible with the signed-URL path. The protected backup remains the recovery copy: 12 `.nc` files, 10 PDFs, `9,451,630` bytes, manifest SHA-256 `2582D15385ACD9BD2FEA7D1A83561668038C4C7E462C4E1D4D7F7F1971138D2E`.
- The live authenticated Workshop session loaded the Run List and existing production job data. One production PDF and one `.nc` CNC file were opened through the app's signed-file controls. No Auth, database business data, or Storage object was changed.
- The signed-URL contract remains fixed at 900 seconds; browser-supplied expiry values are ignored. The production smoke used the live compatibility release and the deployed `job-file-url` boundary, with fixed-expiry behaviour also covered by the direct and regression checks above.
- Rollback status: no rollback required. All post-migration checks passed. Adam remains the rollback operator and restoration owner. The documented rollback procedures remain available if a later incident occurs.

## Adam manual smoke confirmation — 2026-08-14

- Adam manually checked the live Cabinet Ninja app and confirmed that the required production files are good, including the `.nc` CNC production files and PDFs.
- The authenticated file smoke test is complete: live Run List data, one PDF, and one `.nc` CNC file were opened successfully through the signed-file path after private Storage cutover.
- Adam's manual confirmation and the final authenticated smoke test agree that the required production files remain usable.

## Adam production approval

- Free-plan/no-PITR manual-backup risk: accepted.
- Cutover window: now, New Zealand time; evidence capture `2026-08-14T15:55:29+12:00`.
- Rollback operator: Adam.
- Final production decision: `Final production GO: Yes`.

## After-hours execution status — 2026-08-12 21:58 NZ time

- The earlier after-hours execution record is retained as historical evidence; the current approved rollout is recorded in the controlled production rollout section above.
- Stage A completed: `202607240002_role_profile_foundation.sql` applied successfully. The restrictive RLS migration stopped as designed before changing policies because Owner/Admin bootstrap had not yet occurred.
- Stage B completed: the single confirmed Auth user `info@cabinetninja.co.nz` was verified as Adam's intended Owner/Admin account; the approved bootstrap succeeded and one active Owner/Admin profile was verified. The Auth UUID is not recorded here.
- Stage C completed: the reviewed `job-file-url` Edge Function was deployed to project `xoyzmjbjbaknvgtoofar`.
- Stage D completed as the approved application-only step: `main` was fast-forwarded to `b22f7cb`, GitHub Pages published the compatibility release, and read-only live smoke checks confirmed the login form, Run List route, signed-URL markers, legacy `storage_path` handling, and `.nc` compatibility.
- No production business data or Storage objects were moved, renamed, deleted, or overwritten. Migrations `202607240003` through `202607240005` are now applied in the authorised order.

## Exact STOP/GO points

### Completed preflight gate

The compatibility release is live, Adam's manual file smoke confirmation is complete, the reconciled 22-object backup is verified, and the four production approvals were recorded before the authorised cutover.

### GO gate before any schema work

The approved operator, using a verified production connection, confirmed:

- project ref is exactly `xoyzmjbjbaknvgtoofar`;
- remote history is exactly `202607240001` and dry-run lists only `202607240002`–`202607240005`;
- current catalog/RLS/Storage state matches the Phase 1A evidence;
- backup/PITR restore point predates all changes, is restorable, and has a named owner;
- Adam's Auth UUID and all internal users are verified; no test account is assigned;
- customer access and invitations remain disabled.

The exact production cutover steps performed were:

1. Record Adam's Free-plan/no-PITR acceptance, NZ-time cutover window, rollback operator, and explicit `Final production GO: Yes`.
2. Reconfirm project `xoyzmjbjbaknvgtoofar`, published compatibility release `b22f7cb`, the protected 22-object backup, and that only migrations `202607240001` and `202607240002` are applied. Do not reapply `202607240002`.
3. Apply `202607240003` only; verify restrictive role-based access and denied unassigned access. Stop on any unexpected policy or data result.
4. Apply `202607240004` only; verify the seven dashboard columns and three indexes. Stop on any unexpected schema result.
5. At the approved NZ-time window, apply `202607240005` only; verify `job-files` is private, the exact MIME/extension policy is active, and no object paths or contents moved.
6. Run the authenticated compatibility smoke test for legacy and new paths: Owner/Admin and Workshop access to `.nc` and PDFs, denial for Office, Install, Read-only, unassigned, unauthenticated, and customer callers, fixed 900-second signed URLs, and rejection of generic octet-stream files.
7. Record the final production GO decision. All checks passed; no rollback was required.

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

The compatible browser code and signed-URL Edge Function are live. Adam's manual file smoke confirmation and the final authenticated Workshop smoke passed after the bucket became private. Customer access remains disabled throughout.

## Production cutover sequence

The exact production cutover steps and their results are listed under the completed GO gate above. Migrations `202607240003` through `202607240005` are applied; no further migration, unrelated schema change, Auth change, or deployment is part of this rollout.

## Rollback decision points

- Before `202607240003`: do not continue; no policy replacement has been authorized.
- Before the private-file commit: restore the prior public bucket/policies if compatibility or access checks fail.
- After private Storage cutover: use the explicit administrator recovery and Storage rollback scripts only under the named incident decision; these scripts do not move or delete objects.
- Any rollback must preserve migration history; do not repair or rewrite the remote ledger.

## Updated recommendation after rollout

**GO — release evidence and private cutover are complete.** The manual database backup and isolated schema/data restore succeeded. The protected 22-object Storage backup, all 12 `.nc` hashes, EFS protection, metadata reconciliation, and one-file `.nc`/PDF restore rehearsal are verified. The compatibility release is live at `b22f7cb` and the approved private Storage cutover passed.

## Historical final recommendation (superseded by executed rollout below)

The following pre-cutover NO-GO text is retained as historical evidence only. It is superseded by the executed rollout recorded in the final executed status section below.

## Final executed status

**GO — controlled Phase 1B rollout completed successfully.** The manual database backup and isolated schema/data restore succeeded. The protected 22-object Storage backup, all 12 `.nc` hashes, EFS protection, metadata reconciliation, one-file `.nc`/PDF restore rehearsal, ordered migrations, least-privilege checks, regression checks, and final authenticated smoke passed.

The reviewed implementation is `37301e3065339872ee7db70ee2fe39666a763c36`; published `main` is `b22f7cb2f5ca38795f3749a8c8705fdd9ee43a09`; the compatibility release is live; migrations `202607240003` through `202607240005` are applied in order; `job-files` is private; the 22-object backup remains verified; and final authenticated Run List/PDF/`.nc` smoke passed. No files or business data were moved. Remaining production blockers: none for this approved Phase 1B cutover; continue normal operational backup and rollback ownership under Adam's control.

The historical pre-cutover NO-GO statement above is superseded. The executed status in this report is authoritative.

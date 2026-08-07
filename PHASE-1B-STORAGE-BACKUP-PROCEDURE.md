# Phase 1B protected Storage backup procedure

This is a supervised, read-only operational procedure. It is not a migration and must not be run as part of a GitHub push or a normal deployment. Do not commit downloaded files, customer data, Auth UUIDs, credentials, or backup archives to this repository.

## Required evidence before the private-bucket cutover

1. Use the verified production project `xoyzmjbjbaknvgtoofar` and record the operator, UTC timestamp, bucket name, and backup destination in the protected change record.
2. Export the `job-files` object metadata separately from the database dump. The database backup records metadata only; it does not contain Storage file contents.
3. Copy all 12 existing `.nc` objects unchanged. Preserve each exact object path, filename, byte length, MIME type (`application/octet-stream`), and content SHA-256. Do not rename, normalise, or re-encode them.
4. Verify the eight PDF objects as a separate inventory and include their exact paths and content hashes in the same protected evidence set.
5. Store the protected file backup in an access-controlled, encrypted location with retention and a named restoration owner. Keep only a redacted manifest (counts, totals, and hashes if approved) in the change record.
6. Perform a non-production restore/read rehearsal of at least one `.nc` and one PDF. Confirm the restored paths are byte-for-byte identical before authorising cutover.

## Cutover and rollback checks

- Before migration `202607240005`, confirm the protected backup predates the bucket-policy command and that all 12 `.nc` hashes are present.
- After cutover, verify an Owner/Admin and a Workshop user can obtain a fixed 900-second signed URL for an existing `.nc` path. Verify Office, Install, Read-only, unassigned, and unauthenticated callers cannot obtain one.
- Do not delete or move any object during verification. Existing legacy `<job-id>/<filename>` paths remain the compatibility source of truth.
- If verification fails, stop application file operations and follow `supabase/production/rollback-private-job-files.sql` under the named incident decision. Rollback restores access policy and bucket visibility; it does not restore file contents.
- A file restore is a separate operator decision using the protected backup and exact-path/hash manifest. Never infer file backup success from a successful database restore.

## Current evidence status

The 2026-08-07 manual database backup contains Storage metadata for 20 objects (12 `.nc`, eight PDFs; approximately 8.36 MB) but no file contents or content SHA-256 hashes. The protected 12-file `.nc` backup and restore rehearsal therefore remain a production preflight blocker.

# Phase 1D: Internal commercial records

## Scope

Phase 1D exposes the existing `public.job_financials` records on internal job views. It is an application-only change: it adds no migration, does not backfill or create production records, and does not change Auth, RLS, Storage, or the customer portal.

The panel covers the existing fields:

- quote reference;
- invoice reference;
- payment status;
- commercial notes.

## Authorisation

The UI is rendered only for `owner_admin` and `office` in Supabase mode. The database remains the authoritative boundary through the existing `job_financials` RLS policies. Workshop, Install, Read-only, unassigned, anonymous, and customer/external users do not receive commercial records or edit controls.

## Concurrency and compatibility

Updates use the record's `job_id` primary key and previously observed `updated_at`. A stale update returns a conflict instead of silently overwriting the current record. Concurrent first creation of a job financial record is also treated as a conflict.

If an older compatible environment does not have `job_financials`, the panel is replaced by a nonfatal migration message and ordinary job viewing/editing continues. Existing job IDs, `CN-####` numbers, leads, attachments, files, Storage paths, signed URLs, and customer portal-disabled behaviour are unchanged.

## Release gate

This branch is review-only. A later approval is required before merging to `main` or allowing any Pages release. No production migration or data action is part of Phase 1D.

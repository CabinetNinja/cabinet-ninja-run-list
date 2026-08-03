# Cabinet Ninja Phase 1A Audit

## Scope and evidence

- Audited repository base: 3586f196108c707b241b6ef30f88510d69afc0c3.
- Production project: xoyzmjbjbaknvgtoofar (ap-northeast-2, PostgreSQL 17).
- This work was read-only. No production data, objects, policies, bucket settings, configuration, users, or migration history changed.
- Live confirmed facts came from a schema-only public/storage dump, a SELECT-only catalog query, and remote migration listing. No business rows, Storage object names, or file contents were read or retained.
- Tracked source facts are the six existing SQL scripts and application source; they are not treated as live unless stated below.

## Confirmed production results

Production contains the 20 expected public business tables, all expected pre-dashboard columns/keys, all operational indexes, 40 unrestricted authenticated-user policies, and the job-files bucket. All 20 tables have RLS enabled; none force RLS.

Exact table and column inventory, keys, indexes, triggers, policy model, Storage facts, and schema-dump hash are in supabase/baseline/202607240001-production-schema.md.

### Tables

activity_history, categories, checklist_template_items, checklist_template_sections, checklist_templates, cut_part_suggestions, cut_pattern_revisions, cut_patterns, cut_runs, items, job_checklist_items, job_checklist_sections, job_checklists, job_files, jobs, leads, material_template_items, material_templates, remake_requests, suppliers.

### Keys, functions, views, triggers, and grants

- All expected primary, foreign, unique, and check constraints match pre-dashboard tracked source. categories.category_name and cut_runs(cut_pattern_revision_id, run_number) are unique. leads.converted_job_id and cut_patterns.current_revision_id remain text fields without foreign keys.
- There are no public or storage views.
- Public functions: tracked set_updated_at() and production-only rls_auto_enable(). The enabled ensure_rls event trigger runs rls_auto_enable() for CREATE TABLE, CREATE TABLE AS, and SELECT INTO. This production object is not tracked in the repository.
- The 18 expected set_updated_at row triggers exist. job_checklist_sections and activity_history intentionally have none.
- anon, authenticated, and service_role have USAGE on public/storage and default ALL table privileges on public tables; RLS is the effective row-access control.

### Indexes and source drift

All non-dashboard tracked application indexes exist. These tracked indexes are genuinely absent from production:

- leads_next_action_due_idx
- jobs_next_action_due_idx
- jobs_target_install_date_idx

The corresponding tracked dashboard columns are absent too:

| Table | Columns absent from production |
| --- | --- |
| leads | next_action, next_action_due_date, last_contacted_at |
| jobs | priority, next_action, next_action_due_date, target_install_date |

No other table or column difference was found between the live 20-table shape and the combined pre-dashboard source scripts. The dashboard migration is source-only, not a production fact.

### RLS and Storage

Production has the exact unrestricted policy design previously seen in source: every business table has one authenticated SELECT policy using true and one authenticated ALL policy using true with check true. There are 40 policies total. Thus broad authenticated access is live, not merely tracked.

The live job-files bucket exists with public = true and no size/MIME limit. storage.objects has the tracked authenticated SELECT and INSERT policies for job-files; no Cabinet Ninja UPDATE or DELETE object policy exists. No file or object metadata was downloaded or exposed.

## Migration history and safe baseline

Remote migration history contains only 202607240001. The repository previously had no Supabase migration ledger. It now has supabase/migrations/202607240001_production_schema_baseline.sql, a comment-only no-op marker, plus the non-executable schema manifest.

The shared version aligns local and remote migration history without applying or changing anything. The historical marker deliberately contains no DDL, so adding it cannot recreate, overwrite, or modify production. Future changes must use new reviewed migration versions; remote history was not repaired or changed.

## Application and security observations

- The PWA connects directly from the browser and has no server-side authorization layer or internal roles.
- Broad client-side loads and whole-collection upserts can overwrite stale concurrent state.
- job_files.file_url assumes public URLs, so application changes must precede a private-bucket cutover.
- No Edge Functions are deployed (confirmed in the initial audit).

## Required approval before implementation

PROPOSED-ACCESS-MODEL.md covers proposed roles, private files, customer-access boundary, rollout sequence, and Adam's pending decisions. Resolve dashboard drift as a new migration only; never fold it into the historical baseline.

## Test results

- Node test runner: 11 passed, 0 failed.
- Vitest login-containment check: 1 passed, 0 failed.
- Total: 12 passed, 0 failed, 0 skipped.

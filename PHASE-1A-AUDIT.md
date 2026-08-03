# Cabinet Ninja Phase 1A Audit

## Audit Baseline

- Repository: `CabinetNinja/cabinet-ninja-run-list`
- Audited revision: `3586f196108c707b241b6ef30f88510d69afc0c3` (`Fix refreshed cut sheets and Dymo label printing`)
- Production project: `cabinet-ninja-run-list` (`xoyzmjbjbaknvgtoofar`), active and healthy in `ap-northeast-2`, PostgreSQL 17.
- Scope: read-only. No production data, schema, Auth, RLS, Storage, functions, or configuration was changed.

Evidence labels used below:

- **Live confirmed**: obtained from read-only Supabase CLI output.
- **Repository defined**: obtained from the tracked SQL and application source; production parity is not claimed unless separately noted.
- **Blocked**: requires an administrator dashboard view or a production schema dump that could not be completed in this environment.

## Executive Summary

This is a static, browser-only PWA. It connects directly from each browser to Supabase using the JavaScript client and a publishable/anon key in `run-list-config.js`. It has no application server, no server-side authorization layer, and no Edge Functions. Authenticated users currently share one broad operational data set.

The live database has all 20 public tables expected by the tracked schema, and its observable primary, unique, and operational indexes match the repository except for the three dashboard-planning indexes. Production has one remote migration-history record, but the repository has no `supabase/migrations` history. This is a material schema-governance and drift risk.

The principal security concern is the repository-defined policy model: every authenticated user can read and write every business row. The tracked `job-files` bucket is public and stores Mozaik PDFs and CNC-related files. Before the system expands to customers, financial details, or external users, the data model needs an explicit internal role model, versioned migrations, and a non-public file-access design.

## 1. Application Structure And Supabase Connection

### Browser application

- `index.html` is the shell and loads Supabase JS from jsDelivr, then `run-list-config.js`, then `app.js`.
- `app.js` is a single large client-side application containing routing, rendering, PDF parsing, Dymo label generation, state handling, and the Supabase data layer.
- `styles.css` contains all styling. `manifest.webmanifest`, `service-worker.js`, and `icon.svg` provide PWA installation/offline support.
- `vendor/pdfjs/` is bundled for local PDF parsing.
- The current routes cover Home/Dashboard, Run List/Suppliers, Leads, Orders, Jobs, Workshop/CNC, History, Settings, checklists, file import, Dymo labels, cutting mode, and remakes.

### Connection model

`createDataStore()` uses Supabase only when `window.RUN_LIST_CONFIG` supplies both `supabaseUrl` and `supabaseAnonKey` and the SDK has loaded. Otherwise it uses browser `localStorage` under `cabinet-ninja-run-list-v1`.

The Supabase client is created in the browser with persisted/auto-refreshed session handling. When `requireAuth` is true, loading requires a current Auth session. Magic-link sign-in calls `signInWithOtp` with the current app URL as `emailRedirectTo` and `shouldCreateUser: false`. The app uses the session email only for display/audit fields; it has no application role or permission model.

`run-list-config.js` is tracked and is precached by the service worker. It must contain only the public project URL and publishable/anon key, never a service-role key or database credential.

## 2. Data Model

All primary keys are text IDs generated from `gen_random_uuid()::text` in the tracked schema. Timestamps are `timestamptz` unless noted. The following is repository-defined, with table and index existence live-confirmed by read-only statistics where noted.

### Core tables

| Table | Columns and keys | Relationships |
| --- | --- | --- |
| `suppliers` | `id` PK; `supplier_name`, `supplier_type`, `town`, `default_contact`, `notes`, `active`, `created_at`, `updated_at` | Referenced by `items.supplier_id` and optionally `material_template_items.supplier_id`. |
| `leads` | `id` PK; `lead_number`, `lead_name`, `client_name`, `phone`, `email`, `location`, `source`, `status`, `priority`, `next_follow_up`, `next_action`, `next_action_due_date`, `last_contacted_at`, `notes`, `converted_job_id`, `active`, timestamps | `converted_job_id` is plain text: no foreign key to `jobs`. |
| `jobs` | `id` PK; `job_number`, `client_name`, `job_name`, `location`, `status`, `priority`, `next_action`, `next_action_due_date`, `target_install_date`, `active`, timestamps | Parent for items, checklists, files, cut patterns, remakes, activity. |
| `categories` | `id` PK; `category_name` unique; `notes`, timestamps | Referenced by `items.category_id` and optionally `material_template_items.category_id`. |
| `items` | `id` PK; `item_name`, `quantity`, `unit`, `supplier_id`, `job_id`, `category_id`, `type`, `status`, `needed_by`, `priority`, `notes`, `product_link`, `photo_url`, timestamps, `completed_at` | Required FK to `suppliers`; optional FKs to `jobs` and `categories`. |
| `material_templates` | `id` PK; `template_name`, `notes`, `active`, timestamps | Parent of `material_template_items`. Not loaded or used by current app code. |
| `material_template_items` | `id` PK; `template_id`, `item_name`, `quantity`, `unit`, `supplier_id`, `category_id`, `type`, `priority`, `notes`, `sort_order`, timestamps | `template_id` FK with cascade delete; optional supplier/category FKs. Not loaded or used by current app code. |

The tracked enums are `run_item_type` (`pickup`, `order`, `delivery`, `stock`), `run_item_status` (`needed`, `ordered`, `ready_to_collect`, `picked_up`, `done`, `cancelled`), and `run_item_priority` (`low`, `normal`, `urgent`).

### Checklists

| Table | Columns and keys | Relationships |
| --- | --- | --- |
| `checklist_templates` | `id` PK; `name`, `type`, `description`, `active`, timestamps | Parent of template sections. |
| `checklist_template_sections` | `id` PK; `template_id`, `section_name`, `sort_order`, timestamps | FK to template, cascade delete. |
| `checklist_template_items` | `id` PK; `section_id`, `item_text`, `sort_order`, `required`, `default_notes`, `allow_photo`, timestamps | FK to template section, cascade delete. |
| `job_checklists` | `id` PK; `job_id`, `template_id`, `checklist_type`, `title`, `status`, `override_note`, timestamps, `completed_at` | Required job FK, cascade delete; optional template FK, set null on delete. |
| `job_checklist_sections` | `id` PK; `job_checklist_id`, `section_name`, `sort_order` | FK to job checklist, cascade delete. |
| `job_checklist_items` | `id` PK; `job_checklist_section_id`, `item_text`, `checked`, `checked_at`, `checked_by`, `required`, `notes`, `photo_url`, `issue_status`, `sort_order`, timestamps | FK to job checklist section, cascade delete. |

The tracked enums are `checklist_type` (`packing`, `qc_completion`, `site_arrival`, `build_readiness`, `measure_up`, `delivery`, `custom`), `checklist_status` (`not_started`, `in_progress`, `complete`, `archived`), and `checklist_issue_status` (`none`, `issue_found`, `to_fix`, `fixed`, `accepted`, `not_applicable`).

### Workshop, CNC, and remake tables

| Table | Columns and keys | Relationships |
| --- | --- | --- |
| `job_files` | `id` PK; `job_id`, `storage_path`, `file_url`, `file_kind`, `original_filename`, `internal_filename`, `file_hash`, `file_size`, `mime_type`, `imported_at`, `imported_by`, `source`, `notes`, `is_superseded`, timestamps | Required job FK, cascade delete. |
| `cut_patterns` | `id` PK; `job_id`, `material_code`, `material_description`, `thickness`, `pattern_number`, `current_revision_id`, `status`, timestamps | Required job FK, cascade delete. `current_revision_id` has no FK. |
| `cut_pattern_revisions` | `id` PK; `cut_pattern_id`, `job_id`, `filename_revision`, `internal_revision`, `required_run_quantity`, `completed_run_quantity`, `pdf_file_id`, `nc_file_id`, `pdf_filename`, `nc_filename`, `file_hash_pdf`, `file_hash_nc`, `is_current`, `is_superseded`, `imported_at`, `imported_by`, `revision_notes`, `production_status`, `review_required`, `review_reason`, timestamps | Required FKs to pattern and job; optional file FKs set null on deletion. Check constraints require a positive required quantity and prevent completed quantity exceeding it. |
| `cut_runs` | `id` PK; `cut_pattern_revision_id`, `run_number`, `status`, `started_at`, `started_by`, `completed_at`, `completed_by`, `notes`, `has_problem`, timestamps; unique (`cut_pattern_revision_id`, `run_number`) | Revision FK, cascade delete. |
| `cut_part_suggestions` | `id` PK; `cut_pattern_revision_id`, `source_part_number`, `part_name`, `width`, `length`, `banding`, `cabinet_number`, `comment`, `pdf_page_number`, `raw_text`, timestamps | Revision FK, cascade delete. |
| `remake_requests` | `id` PK; `job_id`, source/destination revision IDs, source suggestion ID, part identity/details, dimensions/banding, `reason`, `damage_stage`, `notes`, `priority`, `required_by`, `status`, responsibility/timeline fields, `photo_url`, timestamps | Job FK cascade delete; optional revision/suggestion FKs set null on deletion. Check requires a part number, part name, or description and quantity greater than zero. |
| `activity_history` | `id` PK; `job_id`, `entity_type`, `entity_id`, `action`, `user_email`, `happened_at`, `previous_value`, `new_value`, `reason`, `notes` | Optional job FK set null on deletion. |

The tracked enums are `cut_pattern_status` (`files_incomplete`, `ready_for_cnc`, `cutting`, `partially_cut`, `cut_complete`, `problem`, `superseded`, `cancelled`) and `remake_status` (`requested`, `waiting_to_add_to_mozaik`, `added_to_mozaik`, `waiting_for_updated_files`, `ready_for_cnc`, `cut`, `edge_banding`, `quality_check`, `returned_to_job`, `cancelled`).

### Live table and index evidence

**Live confirmed:** all 20 public tables above are present. The public table statistics also show existing operational data in the core, checklist, and workshop tables; no business records were read. `material_templates`, `material_template_items`, `remake_requests`, and `cut_part_suggestions` are presently estimated at zero rows.

**Live confirmed indexes:** primary-key indexes for all 20 tables; `categories_category_name_key`; the unique `cut_runs` revision/run index; and the following named indexes:

- `items_active_supplier_idx` (`supplier_id,status`), `items_active_job_idx` (`job_id,status`), `items_status_idx`, `items_needed_by_idx`
- `suppliers_active_idx`; `leads_status_idx`; `leads_follow_up_idx`; `leads_lead_number_unique_idx`; `jobs_active_idx`
- `material_template_items_template_idx`
- `checklist_template_sections_template_idx` (`template_id,sort_order`); `checklist_template_items_section_idx` (`section_id,sort_order`); `job_checklists_job_idx` (`job_id,checklist_type,status`); `job_checklist_sections_checklist_idx` (`job_checklist_id,sort_order`); `job_checklist_items_section_idx` (`job_checklist_section_id,sort_order`)
- `job_files_job_idx` (`job_id,file_kind`); `cut_patterns_job_idx` (`job_id,material_code,pattern_number`); `cut_revisions_pattern_idx` (`cut_pattern_id,is_current,is_superseded`); `cut_runs_revision_idx` (`cut_pattern_revision_id,run_number`); `remakes_job_status_idx` (`job_id,status`); `remakes_required_by_idx` (`required_by,status`); `activity_job_idx` (`job_id,happened_at`)

**Confirmed drift:** the tracked dashboard migration defines `leads_next_action_due_idx`, `jobs_next_action_due_idx`, and `jobs_target_install_date_idx`; none appears in the live index inventory. Column existence could not be verified without the blocked schema dump.

## 3. Views, Functions, Triggers, Migrations, And Edge Functions

### Repository-defined database objects

- No application views are defined.
- The only tracked SQL function is `set_updated_at()`, which writes `now()` into `updated_at` on update.
- `set_updated_at` is attached to suppliers, leads, jobs, categories, items, material templates/items, checklist templates/sections/items, job checklists/items, job files, cut patterns/revisions/runs/part suggestions, and remake requests. `job_checklist_sections` and `activity_history` have no corresponding `updated_at` trigger.
- The repository carries six manually runnable SQL files: base schema; checklists; leads; lead number; dashboard; workshop/CNC. They are not versioned in the Supabase migration-directory convention.

### Production evidence

- **Live confirmed:** no Edge Functions are deployed.
- **Live confirmed:** production migration history contains a single remote version, `202607240001`.
- **Blocked:** production views, functions, trigger definitions, grants, and their exact parity cannot be asserted because the schema-only dump requires Docker Desktop's Linux engine, which is not currently running.

## 4. Row Level Security And Policies

### Repository-defined policy model

The tracked SQL enables RLS on all 20 business tables. For every table, there are two policies for the `authenticated` role:

1. `authenticated users can read <entity>` for `SELECT` with `USING (true)`.
2. `authenticated users can write <entity>` for `ALL` with `USING (true) WITH CHECK (true)`.

This exact pair applies to suppliers, leads, jobs, categories, items, material templates/items, all six checklist tables, and all seven workshop/remake/activity tables. There is no ownership, company, team, or job assignment condition.

### Production policy status

**Blocked:** the exact live RLS-enabled flags and policy text need the schema dump or dashboard policy view. The current source policies must not be assumed to be production-identical.

## 5. Authentication And Roles

- **Live confirmed:** normal Supabase platform roles include `anon`, `authenticated`, `service_role`, `authenticator`, and Supabase administration roles. This does not expose Auth users or application permissions.
- **Repository defined:** the app uses magic links and has no custom role table, claims, membership table, or authorization check beyond the authenticated session.
- **Repository defined:** the login call explicitly sets `shouldCreateUser: false`.
- **Blocked:** current Auth users, their identities, Auth provider settings, sign-up disablement, magic-link configuration, redirect allow-list, and rate limits are dashboard-only/administrator controls in this audit environment.

## 6. Storage

The tracked workshop migration creates `job-files` with `public = true`. It grants authenticated users insert and select access to `storage.objects` where `bucket_id = 'job-files'`. The app uploads files to that bucket, stores both `storage_path` and a public URL in `job_files`, downloads saved PDFs for Dymo labels, and deletes only the `job_files` database row when a file is removed.

**Blocked:** the actual bucket list, actual bucket visibility, actual object policies, and existing object inventory require the dashboard or schema dump. The tracked policy design has no object update/delete policy and can leave orphaned uploaded objects after metadata deletion.

## 7. Migration History And Drift

- **Live confirmed:** one remote migration exists: `202607240001`.
- **Repository defined:** no `supabase/migrations` folder exists; the six tracked SQL files are manual scripts with no recorded production application order.
- **Live confirmed:** all 20 expected public tables and the non-dashboard indexes are present.
- **Confirmed difference:** the three dashboard-planning indexes are absent from the live index inventory.
- **Blocked:** exact columns, foreign keys, checks, triggers, policies, storage objects, grants, and functions cannot be compared until a schema-only dump succeeds.

## 8. Existing Application Reads And Writes

### Reads

At startup, `loadTables()` performs `SELECT *` against suppliers, leads, jobs, categories, items, six checklist tables, and seven workshop tables. Results are ordered client-side by basic operational fields; activity history is capped at 400 records. The two material-template tables are not read by the current app.

### Inserts and updates

Nearly every interactive change calls `saveState()`. In Supabase mode, it upserts the entire in-memory collection for each of the 18 app-used tables, keyed by `id`. This covers supplier/category settings, lead creation/editing/conversion, job creation/editing/planning, run-list items, templates/checklists, file-import metadata, cut patterns/revisions/runs, remakes, and activity entries.

### Deletes and file operations

- Direct deletes: `items`, `checklist_template_items`, and `job_files` metadata rows.
- Storage upload: writes selected PDF/NC/CNC/TAP/GCODE files to `job-files`; metadata is then upserted through `saveState()`.
- Storage download: reads saved PDFs for Dymo labels, using a public URL first and authenticated Storage download as fallback.
- There are no Supabase RPC calls, SQL calls, Realtime subscriptions, or Edge Function invocations in the app.
- Auth calls are magic-link sign-in and sign-out only.

## 9. Backup And PITR

**Blocked:** backup schedule, restore testing, and Point-in-Time Recovery status are available only through project administration. The dashboard browser session could not be reached in this environment, and the CLI commands used do not expose those settings.

## 10. Security And Architecture Risks

1. **Broad authenticated access:** the repository policy model grants every authenticated user read/write/delete-equivalent access to every business row. This is unsuitable for customer/external access and weak for internal accountability.
2. **Public production files:** the tracked `job-files` bucket is public and stores cut-sheet/CNC-related files. Public URLs and unrestricted authenticated reads are too broad for future customer, commercial, or site data.
3. **No durable migration ledger:** source SQL and the single remote migration record cannot presently establish production parity. Schema changes are hard to audit and roll back safely.
4. **Whole-state upserts:** a single screen action can overwrite stale copies of unrelated rows held in another browser. There is no optimistic concurrency/version field or transactional workflow boundary.
5. **Weak relational boundaries:** `leads.converted_job_id` and `cut_patterns.current_revision_id` are not foreign keys. Customer, contact, site, commercial, approval, procurement, financial, and installation concepts are not modeled centrally.
6. **Audit history is mutable:** activity rows are generated in the browser and use the same permissive write policy; they are not immutable or database-generated.
7. **Local fallback divergence:** local state is written before queued remote persistence. A sync failure leaves a browser-local copy that can diverge from shared data.
8. **Large unfiltered reads:** each signed-in browser loads whole operational tables. This will become costly and exposes more data than role- or job-specific screens need.
9. **Limited automated coverage:** current tests cover lead numbering, magic-link containment, folder/PDF parsing, Dymo saved-PDF loading, and narrow workshop logic. There are no database-contract, RLS, migration, multi-user concurrency, or end-to-end PWA tests in the repository.
10. **External CDN dependency:** the Supabase SDK is loaded from a CDN without a locked application build pipeline or subresource integrity.

## Phase 1B Plan: Central Jobs And Operational Dashboard

Phase 1B should extend the current Run List, not replace it. It should remain a single internal Cabinet Ninja PWA with Dashboard, Leads, Customers, Jobs, Run List/Orders, Checklists, Suppliers, Photos/Files, and Settings. Xero remains the accounting system; Phase 1B stores operational references/statuses, not a second accounting ledger.

### Preconditions

1. Start Docker Desktop's Linux engine and repeat the schema-only public/storage dump, or provide an administrator read-only dashboard session.
2. Record the exact production schema, policies, storage settings, Auth sign-up/magic-link settings, and backup/PITR status.
3. Create a source-controlled migration baseline matching the verified production state before applying any schema change.
4. Decide the internal role model: at minimum owner/admin, office, workshop, and install; no customer portal or external user access in Phase 1B.

### Delivery sequence

1. **Migration and access baseline:** preserve current functionality while introducing an ordered migration directory, schema contract tests, and a reviewed least-privilege internal RLS plan. Do not alter production until the Phase 1A gaps are closed and the migration is approved.
2. **Central Jobs foundation:** add `customers`, `customer_contacts`, and a backward-compatible expansion of `jobs`. Keep existing IDs and `CN-####` numbering. Add explicit foreign keys from leads to converted jobs and from jobs to customers/sites.
3. **Job lifecycle record:** model commercial, design/approval, procurement, production, installation, financial-reference, and exception/remake state as clear grouped fields or child records. Include owner, next action, due dates, status history, and source references to Xero rather than invoices/payments themselves.
4. **Operational Dashboard:** build from current job, item, checklist, cut-pattern, and remake data. Start with actionable queues: overdue next actions, approvals, procurement blockers, production/CNC readiness, install dates, and exceptions.
5. **Lead and customer flow:** convert a lead to a customer/job through a single transactional workflow that keeps the tracking-number suffix, avoids duplicate contacts, and retains history.
6. **Run List, checklist, and supplier integration:** retain existing items and workshop behavior, attach them to the strengthened job record, and add dashboard projections without breaking current mobile/workshop flows.
7. **Files and photos:** make file metadata first-class with job/customer ownership, type, visibility, and retention rules. Move to a private bucket with signed/authenticated access only after an approved migration and regression tests.
8. **Quality gates:** add migration tests, RLS tests for each internal role, concurrency tests, backup restore verification, and PWA smoke tests before each production rollout.

## Recommended First Phase 1B Implementation Task

Do **not** start by adding dashboard screens. First complete a production-safe migration baseline: reconcile the schema dump with source, add the missing source-controlled migration history, and design/approve the internal role and private-file access model. The first functional migration after that baseline should add the `customers` foundation and backward-compatible `jobs.customer_id` relationship while keeping existing Run List job IDs and `CN-####` numbers intact.

## Audit Blockers And Required Access

To complete the remaining read-only production checks, the following is needed:

1. Docker Desktop must be running with its Linux engine available so `supabase db dump --linked --schema public,storage` can run. This is a schema-only read and requires no production change.
2. A read-only Supabase dashboard session, or screenshots/export of the relevant settings, for Auth providers/sign-up/magic-link/redirect configuration, Storage buckets/policies, backup/PITR, and Auth-user inventory.
3. No password, service-role key, or connection string should be sent in chat or committed. Enter any necessary password only into the local masked prompt if the CLI asks for it.

## Test Status

The repository contains 12 focused automated tests: 11 Node tests and one Vitest magic-link containment test. All 12 passed against revision `3586f196`; zero tests were skipped. The isolated audit worktree reused the existing local dependency installation only to invoke Vitest. No tests were modified for this audit.

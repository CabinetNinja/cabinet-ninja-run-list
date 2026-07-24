# Run List

Cabinet Ninja pickup/order list MVP.

## What is included

- Mobile-first supplier pickup/order lists.
- Cabinet Ninja front-page dashboard with urgent actions, stuck leads/jobs, run-list warnings, checklists, upcoming work, and invoice prompts.
- Quick add form with supplier, job, category, type, status, needed-by, priority, notes, and product link.
- Supplier view with active item counts and supplier-only detail.
- Job view with outstanding item counts and job detail grouped by supplier.
- Job-based packing and QC completion checklists generated from editable templates.
- Lightweight lead tracking with follow-up dates, lead statuses, and conversion into jobs.
- Lead and job next-action fields for daily dashboard follow-up.
- Auto-numbered jobs using the Cabinet Ninja `CN-####` format.
- Lead/job stage pipeline: To measure up, To quote, Quoted, Job accepted/declined, Materials, Cut/build, Load, Install, and completion stages.
- Open Jobs hides complete/cancelled/archived jobs by default, with a separate completed/cancelled view.
- Checklist progress, required item completion rules, notes, photo-link fields, and override completion notes.
- Status/orders view.
- Completed history with reopen support for run-list items and retained completed checklists.
- Workshop/CNC run-list dashboard with Mozaik PDF/NC imports, repeated physical run tracking, and remake queue.
- Search across item, supplier, job, category, status, type, and notes.
- Editable supplier list for adding and hiding suppliers.
- PWA files: `manifest.webmanifest`, `service-worker.js`, and `icon.svg`.

## Current storage

This app can run in two modes:

- Supabase mode: shared data across phone, office PC, workshop PC, and future dashboard screens.
- Local mode: browser-only fallback using `localStorage`.

Local fallback stores data under:

```text
cabinet-ninja-run-list-v1
```

That fallback makes the app usable without accounts or setup, but data is per browser/device until Supabase is configured.

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `supabase-schema.sql`.
4. Copy `run-list-config.example.js` to `run-list-config.js`, or edit the existing `run-list-config.js`.
5. Add your Supabase project URL and anon/publishable key:

```js
window.RUN_LIST_CONFIG = {
  supabaseUrl: "https://your-project-ref.supabase.co",
  supabaseAnonKey: "your-publishable-or-anon-key",
  requireAuth: true,
  seedRemoteOnFirstRun: true,
};
```

The schema enables row level security and lets authenticated Supabase users read/write the shared Run List tables. This is intentionally simple for the MVP: everyone who can sign in can work from the same workshop list.

For an existing Supabase project that already has the original Run List tables, run `supabase-checklists-migration.sql` once to add the checklist tables.

Run `supabase-leads-migration.sql` once to add the lead tracking table to an existing project.

Run `supabase-lead-number-migration.sql` once to store automatic `CNL-####` lead numbers. When a lead becomes a job, the app keeps the number and changes its prefix to `CN-####`.

Run `supabase-dashboard-migration.sql` once on existing projects to add next-action and target install date fields used by the dashboard.

Run `supabase-workshop-cnc-migration.sql` once on existing projects to add the Workshop/CNC cut pattern, file import, physical run, remake, and activity-history tables. It also creates a public Supabase Storage bucket named `job-files` for uploaded Mozaik PDFs and NC/CNC/TAP/GCODE files.

## Running locally

Open `index.html` directly for a quick check, or serve the folder over HTTP for full PWA behavior.

If you have a simple static server available, serve this directory and open:

```text
http://127.0.0.1:5177/
```

## Backend path

Use `supabase-schema.sql` as the first backend shape. The existing app data names match the schema closely:

- `suppliers`
- `leads`
- `jobs`
- `categories`
- `items`
- `checklist_templates`
- `checklist_template_sections`
- `checklist_template_items`
- `job_checklists`
- `job_checklist_sections`
- `job_checklist_items`
- `job_files`
- `cut_patterns`
- `cut_pattern_revisions`
- `cut_runs`
- `cut_part_suggestions`
- `remake_requests`
- `activity_history`
- `material_templates`
- `material_template_items`

The material template tables are included only so the database will not fight later material-template work. The checklist template tables are used by the MVP.

## Workshop / CNC workflow

Open the live app at:

```text
https://cabinetninja.github.io/cabinet-ninja-run-list/#/
```

Use the **Workshop** tab for the CNC computer or workshop tablet.

Basic flow:

1. Open a job.
2. Click **Import Cut Files**.
3. Upload the Mozaik PDF and matching `.NC`, `.CNC`, `.TAP`, or `.GCODE` file.
4. Enter the number of physical runs required. Example: if the PDF says `Sheets: 6`, enter `6`.
5. The Workshop dashboard will show progress such as `0 of 6 cut`, `3 of 6 cut`, and `6 of 6 cut`.
6. Use **Mark One Run Cut** after one physical sheet has been cut.
7. Use **Add Remake** or the **Remake Queue** for damaged/missing/incorrect parts.

Safety rules built into the app:

- CNC files are stored only; the app does not execute or edit G-code.
- A superseded revision is labelled **Superseded — Do Not Cut**.
- Completed runs cannot exceed the required run count.
- If a file changes without a filename revision increase, the new version is held for review instead of silently replacing the old one.

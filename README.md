# Run List

Cabinet Ninja pickup/order list MVP.

## What is included

- Mobile-first supplier pickup/order lists.
- Quick add form with supplier, job, category, type, status, needed-by, priority, notes, and product link.
- Supplier view with active item counts and supplier-only detail.
- Job view with outstanding item counts and job detail grouped by supplier.
- Job-based packing and QC completion checklists generated from editable templates.
- Lightweight lead tracking with follow-up dates, lead statuses, and conversion into jobs.
- Auto-numbered jobs using the Cabinet Ninja `CN-####` format.
- Lead/job stage pipeline: To measure up, To quote, Quoted, Job accepted/declined, Materials, Cut/build, Load, Install, and completion stages.
- Open Jobs hides complete/cancelled/archived jobs by default, with a separate completed/cancelled view.
- Checklist progress, required item completion rules, notes, photo-link fields, and override completion notes.
- Status/orders view.
- Completed history with reopen support for run-list items and retained completed checklists.
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
- `material_templates`
- `material_template_items`

The material template tables are included only so the database will not fight later material-template work. The checklist template tables are used by the MVP.

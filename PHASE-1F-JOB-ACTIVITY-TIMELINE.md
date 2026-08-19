# Phase 1F: Job activity timeline

Phase 1F makes the existing internal activity history visible on each job detail view. It is an additive application-only change: no production migration, customer data backfill, Auth change, RLS change, Storage change, file movement, email, or customer portal access is included.

## Change

- Add a Recent Activity panel to the job detail view.
- Read only the existing `activity_history` rows for the selected job.
- Sort newest first and show at most eight entries so the job view stays usable on mobile.
- Keep the existing Workshop/CNC activity card and its narrower empty-state message.
- Escape action and detail text before rendering it into the page.

## Security and compatibility

The timeline reuses the existing activity-history query and existing RLS boundary. It does not add a new table, policy, grant, write path, role, assignment rule, financial-data path, signed-file path, or customer-facing route. Customer portal remains disabled. If the optional Workshop/CNC tables are unavailable, the panel remains nonfatal and shows an empty state.

## Release gate

This branch is local/review-only. A separate approval is required before merging or allowing a Pages release. Existing jobs, IDs, `CN-####` numbers, leads, customers, files, attachments, and history remain unchanged.

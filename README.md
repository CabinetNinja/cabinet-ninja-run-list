# Run List

Cabinet Ninja pickup/order list MVP.

## What is included

- Mobile-first supplier pickup/order lists.
- Quick add form with supplier, job, category, type, status, needed-by, priority, notes, and product link.
- Supplier view with active item counts and supplier-only detail.
- Job view with outstanding item counts and job detail grouped by supplier.
- Status/orders view.
- Completed history with reopen support.
- Search across item, supplier, job, category, status, type, and notes.
- Editable supplier list for adding and hiding suppliers.
- PWA files: manifest.webmanifest, service-worker.js, and icon.svg.

## Current storage

This first version stores data in the browser with localStorage under:

cabinet-ninja-run-list-v1

That makes the app immediately usable without accounts or setup, but data is currently per browser/device. To sync across Android, office PC, CNC/workshop PC, and tablets, wire the same UI to Supabase or another shared backend. The starter schema is in supabase-schema.sql.

## Backend path

Use supabase-schema.sql as the first backend shape. The template tables are included only so the database will not fight later template work. The MVP UI does not use them yet.

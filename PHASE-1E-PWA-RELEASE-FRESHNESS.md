# Phase 1E: PWA release freshness

Phase 1E keeps the installed Cabinet Ninja app aligned with the reviewed source release. It is a local, review-only application change; it does not apply a migration, change production Storage/Auth/RLS, or publish GitHub Pages.

## Change

- Advance the app-shell cache from `cabinet-ninja-run-list-v30` to `cabinet-ninja-run-list-v31` so an installed PWA removes the prior shell after the next service-worker update.
- Match app-shell assets relative to `self.registration.scope` rather than assuming one GitHub Pages repository path. This keeps network-first shell refresh behavior correct if the Pages scope changes.
- Retain `skipWaiting`, `clients.claim`, old-cache deletion, the existing app-shell asset list, and the existing offline fallback behavior.

## Verification

`tests/pwa-release-freshness.test.mjs` verifies the cache advance, critical shell assets, activation cleanup, and scope-relative matching. The full local Node and applicable Phase 1B/1C checks remain required before review.

## Release gate

The branch and draft PR are review-only. A separate approval is required before merging, publishing GitHub Pages, or verifying the live bundle. No production data, Auth users, migrations, RLS, Storage, files, emails, or customer-portal access are changed here.

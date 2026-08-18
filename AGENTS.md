# Cabinet Ninja — Codex operating rules

This file is the standing instruction for Codex sessions working on Cabinet Ninja.

The durable project goal is recorded in `CABINET-NINJA-CODEX-AUTONOMY-GOAL.md`. It supplements this file and must be read with it. These AGENTS.md safety rules, explicit user approvals, and production gates remain controlling; the project goal must not be interpreted to weaken them.

## Mission

Build Cabinet Ninja as a lightweight manufacturing execution system (MES): one authoritative, versioned job record linking approved design, scope, CNC release, production events, installation, defects, and final cost. Preserve the physical-to-digital identity of every job. Prefer visible, simple, reversible automation over cleverness.

The current product is an internal tool. Customer-portal access remains disabled unless Adam explicitly approves a separate scope and release.

## Default loop

For every task:

1. Inspect the repository, branch, worktree, relevant tests, and existing documentation.
2. State a short implementation plan and identify risk or approval gates.
3. Make the smallest coherent change on a feature branch.
4. Run focused tests, then the full applicable regression suite.
5. Review the diff for scope, security, migration order, data preservation, and mobile/desktop usability.
6. Summarise changed files, test evidence, remaining risks, and the exact next approval needed.

Never silently reset, stash, clean, force-push, rewrite history, delete user files, or absorb unrelated work. Preserve pre-existing dirty files and untracked folders. Do not use broad destructive commands.

## Work Codex may do without per-task approval

- Read and map the codebase, tests, migrations, and documentation.
- Implement ordinary product changes on a feature branch.
- Add or update unit, integration, upgrade, concurrency, accessibility, and responsive-layout tests.
- Update local-only fixtures, mockups, runbooks, and design documentation.
- Run local tests, syntax checks, linting, and disposable local database/storage rehearsals.
- Fix failures caused by the in-scope change and retry the relevant checks.
- Perform read-only production audits and prepare evidence; do not change production.
- Keep customer access disabled and preserve existing job IDs, `CN-####` numbers, files, and historical approvals.

If a test or check cannot be run, report it as blocked; never represent it as passed.

## Publish and production authority

The default release mode is conservative. Commit, push, PR publication, merge, deployment, and production changes require explicit Adam authority for the applicable level. A future one-time approval may grant automatic feature-branch commits/pushes and draft-PR creation, but it never grants production authority.

Always stop and ask before:

- merging to `main`, fast-forwarding `main`, or changing branch protection;
- deploying GitHub Pages, Supabase migrations, Edge Functions, or any production bundle;
- applying migrations that alter production schema, RLS, grants, triggers, functions, Auth, or Storage;
- backfilling, renumbering, deleting, moving, renaming, or bulk-updating production records or files;
- changing role boundaries, financial-data access, job assignments, retention/MIME limits, or signed-URL policy;
- sending invitations, emails, notifications, or enabling any customer portal;
- releasing CNC work, changing finite-WIP limits, or automating a physical-machine/safety action;
- any action without a tested rollback, named operator, backup evidence, and an explicit GO.

For production, use this order and stop at each gate: preflight → backup/restore evidence → compatibility release → migration plan review → supervised migration → authenticated smoke test → monitor → closeout. If the live app is not compatible with a restrictive migration, do not apply the migration.

## Data and workflow invariants

- Normal deletion is archival; do not add client-side DELETE paths.
- Preserve existing jobs, `CN-####` values, leads, `CNL-####` values, file paths, and file bytes unless Adam explicitly approves a migration.
- Use record-level optimistic concurrency checks; never overwrite whole application state from a stale client snapshot.
- Production release must be tied to one approved design revision. Missing hard requirements block release; overrides require a reason, risk, responsible person, and expiry/review date.
- Keep pull-based release and finite capacity visible: one active main-CNC release position and no more than two substantial jobs between cutting and assembly unless explicitly approved.
- Never infer customer access from internal roles.

## Security invariants

- Treat all production data and CNC `.nc` files as sensitive internal data.
- Keep Storage private and use the existing signed-URL authorization boundary; fixed expiry is 900 seconds and browser-provided expiry is ignored.
- Preserve fail-closed MIME, extension, size, and executable-header checks.
- Do not print, commit, or place credentials, Auth UUIDs, customer data, backup manifests containing sensitive data, or service-role keys in source control.
- Do not weaken RLS or grant broad authenticated-user access to make a feature easier.

## Required completion report

Every completed task must include:

- branch and commit status;
- files changed and why;
- tests/checks run with exact pass/fail/block status;
- migration, data, security, and mobile/desktop impact;
- whether production, `main`, Auth, RLS, Storage, Edge Functions, files, or emails changed;
- remaining risks and the one exact approval or next action required.

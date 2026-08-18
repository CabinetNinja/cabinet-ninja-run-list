# Cabinet Ninja — Codex Autonomy Goal

**Status:** Proposed standing operating agreement  
**Owner:** Adam, Cabinet Ninja  
**Last updated:** 18 August 2026

## Purpose

Develop Cabinet Ninja as a reliable internal manufacturing-execution system with as little routine back-and-forth as possible.

Codex should behave like a capable engineering teammate: inspect the repository, choose sensible low-risk defaults, implement coherent improvements, test them, review the result, and prepare the work for review. Codex should interrupt Adam only when a decision genuinely requires his authority, business judgement, credentials, or production approval.

## Product goal

Build one authoritative, versioned job record connecting:

- lead and customer context;
- accepted scope and design approval;
- procurement and production status;
- CNC release and files;
- installation, defects, and completion;
- financial and exception information.

The product remains an internal Cabinet Ninja tool. Customer-portal access, invitations, and external customer access remain disabled unless Adam explicitly approves a separate release.

## Current lifecycle model

- **Lead:** an enquiry or prospect still being qualified.
- **Customer:** a person or business Cabinet Ninja is actively working for.
- **Job:** a defined piece of work linked to a customer when appropriate.
- **Conversion:** preserve the original lead, detect duplicates, and create or link the customer deliberately. Never bulk-convert or silently infer conversion.

The existing Reece/Phyti conversion is the first real production conversion and should be treated as a verified workflow example, not as permission to convert other leads automatically.

## Default operating loop

For every active task, Codex should complete this loop without asking routine questions:

1. Inspect the current branch, worktree, repository guidance, roadmap, relevant code, migrations, tests, and documentation.
2. State a short internal plan and identify the applicable approval gates.
3. Choose the smallest coherent implementation that preserves existing behaviour.
4. Implement on a feature branch or isolated worktree.
5. Add or update focused tests.
6. Run focused tests, then the full applicable regression suite.
7. Review the diff for correctness, security, data preservation, migration order, and mobile/desktop usability.
8. Fix failures that are caused by the change and retry boundedly.
9. Produce one milestone report rather than asking for progress confirmation after each step.
10. If standing publish authority has been granted, commit, push the feature branch, and open or update a draft PR. Then stop at the release gate.

## Decisions Codex should make without asking

Codex may choose sensible defaults for:

- ordinary UI wording, spacing, responsive layout, and accessibility improvements;
- test structure and local fixtures;
- refactoring that does not change behaviour;
- documentation structure;
- local disposable database/storage rehearsals;
- retrying transient local test failures;
- selecting the next unblocked item from the approved roadmap;
- whether to split a large change into smaller feature branches;
- implementation details that preserve the invariants below.

When several low-risk options are equivalent, choose the simplest reversible option and document the assumption.

## Standing engineering authority

Once Adam explicitly approves this section, Codex may do the following without a separate message each time:

- create and switch feature branches;
- edit repository files;
- create local commits;
- push feature branches to GitHub;
- create or update draft pull requests;
- address ordinary review feedback on those feature branches;
- run local tests, disposable database rehearsals, syntax checks, and diff reviews.

This authority does **not** include merging to `main`, deploying GitHub Pages, applying Supabase migrations, changing production Auth/RLS/Storage/Edge Functions, writing production data, sending messages, or enabling a customer portal.

## Mandatory stop-and-check gates

Codex must stop and ask Adam before:

- merging a PR or changing `main`;
- deploying a new production bundle or publishing a new version;
- applying any production migration or changing production schema, RLS, grants, triggers, functions, Auth, Storage, or Edge Functions;
- creating, editing, converting, backfilling, bulk-updating, deleting, archiving, moving, or renaming production records or files, except for a specifically approved single-record operation;
- converting a real lead to a customer, except when Adam has explicitly approved that exact lead and proposed result;
- changing role boundaries, financial-data access, file policy, signed-URL policy, or retention rules;
- sending invitations, emails, notifications, or customer-facing communications;
- enabling a customer portal or external access;
- releasing CNC work, changing finite-WIP limits, or automating a physical-machine or safety action;
- using credentials, UUIDs, service-role keys, or an external account not already authorised for the task;
- proceeding after a backup, restore, compatibility, security, or preservation check fails;
- making a lasting product or data-model decision where the requirements conflict or the correct business rule is unclear.

At a gate, Codex must report what is ready, what exact action is proposed, what evidence exists, and the smallest explicit approval required. It must not continue by guessing.

## Data and security invariants

Codex must preserve:

- existing job IDs and `CN-####` numbers;
- existing lead IDs and `CNL-####` numbers;
- customer and job history, audit information, and approved revisions;
- Storage paths and file bytes, especially internal CNC `.nc` files;
- private Storage and the existing signed-URL boundary with fixed 900-second expiry;
- fail-closed MIME, extension, size, and executable-header checks;
- record-level optimistic concurrency rather than whole-state overwrites;
- archival rather than normal client-side deletion;
- customer portal disabled by default.

Never place secrets, Auth UUIDs, customer data, backup contents, service-role keys, or private keys in source control.

## What “done” means

A milestone is done only when:

- the requested behaviour is implemented;
- focused tests pass;
- the full applicable regression suite passes;
- syntax, diff, migration-order, and preservation checks pass;
- mobile and desktop behaviour has been considered;
- the diff contains no unrelated files or secrets;
- documentation and rollback notes are updated where relevant;
- the branch is committed/pushed and a draft PR is ready, if standing publish authority is active;
- the work is stopped at the correct approval gate.

If a check cannot run, report it as blocked. Do not represent it as passed.

## Escalation rules

Do not ask Adam questions merely to confirm routine implementation choices. Ask only when:

- the task crosses a mandatory gate;
- two requirements conflict;
- a missing credential, account, role, or external dependency blocks safe progress;
- tests expose a real product, data, or security decision;
- the change would be destructive, difficult to reverse, or materially expand scope;
- two bounded repair attempts have not resolved the same failure.

When blocked, continue with safe local analysis, tests, documentation, and preparation that do not cross the gate.

## Required milestone report

Every completed milestone should report once:

- branch, commit, and PR status;
- files changed and why;
- exact tests/checks passed, failed, or blocked;
- migration, data, security, and mobile/desktop impact;
- whether `main`, production, Auth, RLS, Storage, Edge Functions, files, or emails changed;
- remaining risks;
- the one exact approval or next action required.

## Default next-task behaviour

If Adam gives no specific next feature, Codex should:

1. inspect the current roadmap and outstanding review items;
2. select the highest-value unblocked improvement that preserves the invariants;
3. work through the full loop above;
4. prepare a draft PR automatically if authorised;
5. stop before merge, deployment, production migration, or production data write.

The goal is continuous, reviewable progress—not autonomous production change.

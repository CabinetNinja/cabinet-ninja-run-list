# Proposed Cabinet Ninja access model

## Status and intent

This document describes the approved Phase 1B internal direction and the remaining implementation details. It makes no production change and does not enable customer access. Adam is the intended owner_admin; Connie may receive office separately once her Auth UUID exists. The current production model gives every authenticated user unrestricted read/write access to all business rows and uses a public job-files bucket. The target model is internal-first, least-privilege, and compatible with the existing PWA while the application is refactored.

## Recommended internal roles

| Role | Purpose | Assignment model |
| --- | --- | --- |
| Owner/Admin | Business owner and trusted system administrator. | Very small, named set; break-glass use is logged. |
| Office | Sales, estimates, scheduling, procurement coordination, and customer contact. | Named internal staff. |
| Workshop | Production, CNC, material handling, and quality completion. | Named internal staff. |
| Install | Site delivery, installation, handover, and job photos. | Named internal staff or approved contractors. |
| Read-only coordinator | Visibility for management or bookkeeper-style operational reference. | Named internal users only; no operational writes. |

Do not use Supabase Auth roles alone as the business model. Phase 1B uses an application-owned staff_profiles table keyed to auth.users.id, with one active internal role per person. A company/tenant key is intentionally deferred because Cabinet Ninja is currently single-company. RLS uses security-definer helper functions that read membership without recursive policy problems.

## Proposed data permissions

| Resource | Owner/Admin | Office | Workshop | Install | Read-only coordinator |
| --- | --- | --- | --- | --- | --- |
| Leads | Full | Create/read/update; no hard delete | No access by default | No access by default | Read summary only |
| Customers and contacts (future) | Full | Create/read/update | Read job-scoped contact/site details | Read assigned-job contact/site details | Read only |
| Jobs | Full | Create/read/update commercial, planning, and schedule fields | Read active jobs; update production/CNC fields | Read active jobs; update install/handover fields | Read only |
| Run-list records/items | Full | Create/read/update | Create/read/update production-related items | Read assigned-job items; update delivery/install completion only | Read only |
| Suppliers | Full | Create/read/update | Read; propose changes through workflow | No access by default | Read only |
| Checklist templates | Full | Create/read/update | Read and complete job instances | Read and complete install job instances | Read only |
| Job checklist instances | Full | Read; create planning checklists | Create/read/update workshop/QC sections | Create/read/update assigned install sections | Read only |
| Files and photos | Full | Upload/read job commercial/admin files | Upload/read workshop files for active jobs | Upload/read assigned-job site photos/documents | Metadata/read only, no download by default |
| Activity/audit history | Read all; exceptional correction through controlled tooling only | Append system-generated events; read relevant | Append system-generated events; read relevant | Append system-generated events; read relevant | Read only |

Assignment-scoped access should use the explicit Phase 1B job_assignments table. It currently records responsibility, filtering, and notifications only: until assignment workflows are implemented, Workshop and Install receive active operational job access only, not customer-wide access.

## Private job-file model

1. Keep the verified job-files bucket identifier for PWA compatibility, but make that bucket private only in a separately approved cutover. Do not rename, delete, or overwrite existing objects as part of the change.
2. Store object paths only in job_files; stop storing public file_url values as the authoritative location. Keep a display filename, MIME type, size, content hash, category, confidentiality level, and created-by metadata.
3. Use Storage RLS policies that require an authenticated staff member and verify role plus job assignment/role scope from the object path and job_files metadata. Grant uploads only to the roles that may create that file category.
4. Generate short-lived signed URLs from a server-side boundary (Edge Function or future backend), after checking the requesting user's membership and job/file permission. Never expose service-role credentials in the browser.
5. Prefer authenticated Storage download for first-party internal PWA views. Signed URLs are appropriate for direct browser preview/download and must expire quickly, be non-cacheable in app state, and be regenerated on demand.
6. Existing public URLs remain read-compatible until their inventory, backup evidence, and signed-URL behaviour are verified. Do not delete public copies or rename existing paths during the first cutover; establish a separate, approved retention and retirement plan.

## Future customer access, not enabled now

Customer access should be a separate product boundary, not a broader authenticated policy. Add it only after internal roles are proven.

Use a customer_portal_memberships table tied to a customer/contact identity and a portal-safe job relation. Expose a narrow portal projection or security-barrier view/API with approved milestones, selected documents, messages, and approved photos only. Customers must never receive direct table privileges over operational tables or blanket Storage bucket access. Customer file downloads should use an authorization-checking server endpoint that mints a file-specific, short-lived signed URL. Do not enable self-service sign-up; invitations and explicit per-customer job sharing require a later approval.

## Safe migration sequence

1. Freeze the verified Phase 1A baseline at version 202607240001; do not edit it.
2. Add new migrations only: staff memberships, role enum, optional company key, job assignments, audit event writer, and schema-contract/RLS tests. Keep legacy policies in place during this compatibility phase.
3. Refactor the PWA to use narrow actions rather than whole-state upserts. Add explicit job assignment handling, user identity display, error handling for denied actions, and server-side signed-URL issuance.
4. Create the private bucket and its tested policies. Implement dual-read/dual-write behind a feature flag; migrate existing file metadata and objects copy-first with verification.
5. Test every role against representative jobs, run-list records, checklists, suppliers, and files in a non-production project. Test expired links, revoked assignments, and a rollback.
6. In a planned maintenance window, replace broad business-table policies with role/membership policies, enable audit logging, and monitor denied requests. Retain a documented break-glass Owner/Admin path.
7. After the private-file migration and rollback window, retire public URLs and the old public bucket according to the approved retention plan.
8. Only after the internal model is stable, design a separate customer portal migration and security review.

## Decisions Adam must approve

1. The named internal role set and which current people belong to each role.
2. Whether Workshop and Install are restricted by explicit job assignment from day one, or temporarily by active-job status.
3. Whether Office may modify production/CNC fields and whether Workshop may modify supplier/run-list purchasing fields.
4. The authority that may delete jobs, records, and files; recommended default is Owner/Admin only, with soft-delete/retention where practical.
5. File categories, retention periods, maximum size/MIME limits, and whether CNC/NC files receive stricter handling than photos/PDFs.
6. The private-bucket migration window, backup/restore verification standard, and public-file retirement date. Approved constraints are a supervised after-hours cutover, at least seven years retention after job completion, and manual Owner/Admin review with no automatic deletion.
7. Whether a server/Edge Function boundary is approved for signed URLs and audit events. This is recommended before any private-file cutover.
8. The future customer portal scope, invitation owner, approved content classes, and the explicit decision not to enable it in the current phase. Customer access remains out of scope for Phase 1B.

# Verified production schema baseline

## Purpose and safety

This is a non-executable, sanitized record of the production public and relevant storage schema verified on 2026-08-03. It contains no credentials, users, business rows, Storage object names, or file contents.

It corresponds to remote migration version 202607240001 and the no-op marker in ../migrations/202607240001_production_schema_baseline.sql. It is a record, not deployable DDL. The schema-only dump SHA-256 before sanitization was ac33a19b91214c8830dbafeb6cdd0dc8b49d84f4640e31f43b229258b5a8e098.

## Public tables and exact columns

| Table | Live columns in ordinal order |
| --- | --- |
| activity_history | id, job_id, entity_type, entity_id, action, user_email, happened_at, previous_value, new_value, reason, notes |
| categories | id, category_name, notes, created_at, updated_at |
| checklist_template_items | id, section_id, item_text, sort_order, required, default_notes, allow_photo, created_at, updated_at |
| checklist_template_sections | id, template_id, section_name, sort_order, created_at, updated_at |
| checklist_templates | id, name, type, description, active, created_at, updated_at |
| cut_part_suggestions | id, cut_pattern_revision_id, source_part_number, part_name, width, length, banding, cabinet_number, comment, pdf_page_number, raw_text, created_at, updated_at |
| cut_pattern_revisions | id, cut_pattern_id, job_id, filename_revision, internal_revision, required_run_quantity, completed_run_quantity, pdf_file_id, nc_file_id, pdf_filename, nc_filename, file_hash_pdf, file_hash_nc, is_current, is_superseded, imported_at, imported_by, revision_notes, production_status, review_required, review_reason, created_at, updated_at |
| cut_patterns | id, job_id, material_code, material_description, thickness, pattern_number, current_revision_id, status, created_at, updated_at |
| cut_runs | id, cut_pattern_revision_id, run_number, status, started_at, started_by, completed_at, completed_by, notes, has_problem, created_at, updated_at |
| items | id, item_name, quantity, unit, supplier_id, job_id, category_id, type, status, needed_by, priority, notes, product_link, photo_url, created_at, updated_at, completed_at |
| job_checklist_items | id, job_checklist_section_id, item_text, checked, checked_at, checked_by, required, notes, photo_url, issue_status, sort_order, created_at, updated_at |
| job_checklist_sections | id, job_checklist_id, section_name, sort_order |
| job_checklists | id, job_id, template_id, checklist_type, title, status, override_note, created_at, updated_at, completed_at |
| job_files | id, job_id, storage_path, file_url, file_kind, original_filename, internal_filename, file_hash, file_size, mime_type, imported_at, imported_by, source, notes, is_superseded, created_at, updated_at |
| jobs | id, job_number, client_name, job_name, location, status, created_at, updated_at, active |
| leads | id, lead_name, client_name, phone, email, location, source, status, priority, next_follow_up, notes, converted_job_id, active, created_at, updated_at, lead_number |
| material_template_items | id, template_id, item_name, quantity, unit, supplier_id, category_id, type, priority, notes, sort_order, created_at, updated_at |
| material_templates | id, template_name, notes, active, created_at, updated_at |
| remake_requests | id, job_id, source_cut_pattern_revision_id, destination_cut_pattern_revision_id, source_part_suggestion_id, part_number, part_name, description, cabinet_number, quantity, material_code, material_description, thickness, width, length, banding, reason, damage_stage, notes, priority, required_by, status, assigned_person, requested_by, requested_at, added_to_mozaik_at, cut_confirmed_at, cut_confirmed_by, quality_checked_at, returned_to_job_at, photo_url, created_at, updated_at |
| suppliers | id, supplier_name, supplier_type, town, default_contact, notes, active, created_at, updated_at |

All IDs are text primary keys with gen_random_uuid()::text defaults. All tables have RLS enabled and none force RLS. Enum types match tracked source: run_item_type, run_item_status, run_item_priority, checklist_type, checklist_status, checklist_issue_status, cut_pattern_status, and remake_status.

## Keys, indexes, functions, views, triggers, grants

- Every table has primary key id; categories.category_name and cut_runs(cut_pattern_revision_id, run_number) are unique.
- The complete expected foreign-key graph is present: items/templates/checklists/files/patterns/revisions/remakes/activity reference their tracked parents with the tracked cascade/set-null behavior. Checks cover cut-run quantities and remake identity/quantity.
- All named operational application indexes in source exist except leads_next_action_due_idx, jobs_next_action_due_idx, and jobs_target_install_date_idx.
- No public/storage views exist. Public functions are set_updated_at() and production-only rls_auto_enable(); enabled event trigger ensure_rls exists. Eighteen expected row triggers exist.
- anon, authenticated, and service_role have schema usage and default ALL table privileges; RLS controls rows.

## RLS and Storage

Every business table has two unrestricted authenticated policies: SELECT using true and ALL using true with check true (40 total). Relevant Storage facts: job-files exists with public = true; no size/MIME limit; storage.objects has authenticated SELECT and INSERT policies for that bucket only. No Storage object data is represented.

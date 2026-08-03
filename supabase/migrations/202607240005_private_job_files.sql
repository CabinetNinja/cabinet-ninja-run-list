-- Phase 1B: local/private configuration for job-files.
-- Apply to production only during the separately approved after-hours cutover.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-files',
  'job-files',
  false,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic',
    'application/pdf',
    'text/plain', 'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/dxf', 'application/acad', 'application/x-dwg'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated users can read job files" on storage.objects;
drop policy if exists "authenticated users can upload job files" on storage.objects;
drop policy if exists "cabinet ninja private job file read" on storage.objects;
drop policy if exists "cabinet ninja private job file upload" on storage.objects;

create policy "cabinet ninja private job file read"
on storage.objects for select to authenticated
using (
  bucket_id = 'job-files'
  and public.can_read_job_file_path(name)
);

create policy "cabinet ninja private job file upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'job-files'
  and public.can_write_job_file_path(name)
);

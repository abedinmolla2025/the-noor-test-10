-- Create public branding bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- Allow public read access to branding assets
create policy "Public read branding assets"
  on storage.objects
  for select
  using (bucket_id = 'branding');

-- Allow admins to upload branding assets
create policy "Admins can upload branding assets"
  on storage.objects
  for insert
  with check (
    bucket_id = 'branding'
    and public.is_admin(auth.uid())
  );

-- Allow admins to update branding assets
create policy "Admins can update branding assets"
  on storage.objects
  for update
  using (
    bucket_id = 'branding'
    and public.is_admin(auth.uid())
  );

-- Allow admins to delete branding assets
create policy "Admins can delete branding assets"
  on storage.objects
  for delete
  using (
    bucket_id = 'branding'
    and public.is_admin(auth.uid())
  );
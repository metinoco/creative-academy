-- Add manual "featured" and "new" flags to courses, controllable from the admin panel.
-- Previously these labels were derived automatically from position in a reviews_count
-- ordering on the landing page, with no real admin control.
alter table public.courses
  add column is_featured boolean not null default false,
  add column is_new boolean not null default false;

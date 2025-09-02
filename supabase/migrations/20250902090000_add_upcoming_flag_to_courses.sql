-- Add an "upcoming" flag to courses to control homepage Upcoming section
alter table public.courses
  add column if not exists upcoming boolean not null default false;

create index if not exists idx_courses_upcoming on public.courses(upcoming);



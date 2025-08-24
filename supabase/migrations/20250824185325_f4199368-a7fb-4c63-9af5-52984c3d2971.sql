-- Database speed improvements: Add indexes for better performance
create index if not exists idx_courses_status_updated on public.courses(status, updated_at desc);
create index if not exists idx_courses_slug on public.courses(slug);

create index if not exists idx_portfolio_status_updated on public.portfolio_projects(status, updated_at desc);
create index if not exists idx_portfolio_slug on public.portfolio_projects(slug);
create index if not exists idx_portfolio_images_project_order on public.portfolio_images(project_id, "order");
create index if not exists idx_portfolio_files_project on public.portfolio_files(project_id);

create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);

-- Ensure there's a default site_settings row
insert into public.site_settings (id, hero_headline, hero_subtitle, hero_cta_label, metrics, partners)
values (1, 'Default Headline', 'Default Subtitle', 'Get Started', '[]'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;
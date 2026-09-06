alter table public.tasks
  add column completed boolean not null default false,
  add column archived_at timestamptz;

create table public.app_settings (
  id integer primary key default 1,
  hide_completed_tasks boolean not null default false,
  theme text not null default 'light',
  constraint app_settings_singleton check (id = 1),
  constraint app_settings_theme_check check (theme in ('light', 'dark'))
);

insert into public.app_settings (id, hide_completed_tasks, theme)
values (1, false, 'light');

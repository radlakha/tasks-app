alter table public.tasks
  add column priority text not null default 'medium',
  add constraint tasks_priority_check check (priority in ('low', 'medium', 'high'));
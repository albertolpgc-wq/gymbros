-- Ampliación v2: perfil (peso/altura) y actividades tipo clase (HIIT con Pablo).
-- Ejecutar una vez en Supabase > SQL Editor > New query > Run

alter table users add column if not exists weight_kg numeric;
alter table users add column if not exists height_cm numeric;

create table if not exists activities (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  exercise_id text not null,          -- p.ej. 'hiit-pablo'
  day date not null,
  minutes numeric not null default 0,
  rpe numeric not null default 5,     -- dureza 1-10
  note text default '',
  created_at timestamptz default now()
);
create index if not exists activities_user_day on activities(user_id, day);

grant select, insert, update, delete on table activities to anon, authenticated;
alter table activities enable row level security;
drop policy if exists "abierto" on activities;
create policy "abierto" on activities for all to anon, authenticated using (true) with check (true);

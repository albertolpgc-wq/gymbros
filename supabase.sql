-- Ejecutar una vez en Supabase > SQL Editor > New query > Run

create table if not exists users (
  id uuid primary key,
  name text not null,
  emoji text default '💪',
  created_at timestamptz default now()
);

create table if not exists sets (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  exercise_id text not null,
  day date not null,
  weight numeric not null default 0,
  reps numeric not null default 0,
  warmup boolean not null default false,
  created_at timestamptz default now()
);
create index if not exists sets_user_day on sets(user_id, day);

create table if not exists notes (
  user_id uuid not null references users(id) on delete cascade,
  exercise_id text not null,
  text text default '',
  updated_at timestamptz default now(),
  primary key (user_id, exercise_id)
);

create table if not exists exercise_photos (
  exercise_id text primary key,
  data text not null,            -- imagen JPEG comprimida en base64
  updated_at timestamptz default now()
);

-- Dar acceso a la API (por si el proyecto se creó sin "Grant API access to new tables")
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table users, sets, notes, exercise_photos to anon, authenticated;

-- Sin contraseñas: cualquiera con la app puede leer y escribir (uso entre colegas).
alter table users enable row level security;
alter table sets enable row level security;
alter table notes enable row level security;
alter table exercise_photos enable row level security;

do $$
declare t text;
begin
  foreach t in array array['users','sets','notes','exercise_photos'] loop
    execute format('drop policy if exists "abierto" on %I', t);
    execute format('create policy "abierto" on %I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;

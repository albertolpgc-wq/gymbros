-- Ampliación v3: sexo y edad en el perfil (para afinar las kcal).
-- Ejecutar una vez en Supabase > SQL Editor > New query > Run
alter table users add column if not exists sex text;      -- 'h' hombre / 'm' mujer
alter table users add column if not exists age numeric;

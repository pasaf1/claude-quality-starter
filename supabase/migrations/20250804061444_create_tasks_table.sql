create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null
);

create extension if not exists pgcrypto;

create table if not exists intake_links (
  id uuid primary key default gen_random_uuid(),
  appointment_id text not null unique,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists intake_responses (
  id uuid primary key default gen_random_uuid(),
  intake_link_id uuid not null unique references intake_links(id) on delete cascade,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);

alter table intake_links enable row level security;
alter table intake_responses enable row level security;

create index if not exists idx_intake_links_appointment_id on intake_links(appointment_id);
create index if not exists idx_intake_responses_link_id on intake_responses(intake_link_id);

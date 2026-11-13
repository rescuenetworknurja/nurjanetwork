create table public.phone_otps (
  phone text primary key,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  sent_at timestamptz not null default now(),
  verified_at timestamptz
);
grant all on public.phone_otps to service_role;
alter table public.phone_otps enable row level security;
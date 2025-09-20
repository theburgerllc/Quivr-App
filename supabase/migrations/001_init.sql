-- Enable extensions
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- User profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  display_name text,
  age int check (age is null or (age >= 18 and age <= 99)),
  gender text,
  pronouns text,
  tribe text,
  position text,
  body_type text,
  height_cm int,
  weight_kg int,
  bio text,
  photo_url text,
  photos jsonb default '[]'::jsonb,
  lat double precision,
  lon double precision,
  geom geography(Point,4326) generated always as (case when lat is null or lon is null then null else st_setsrid(st_makepoint(lon,lat),4326)::geography end) stored,
  show_distance boolean default true,
  hide_online boolean default false,
  is_online boolean default false,
  plan text default 'free',
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  a uuid not null,
  b uuid not null,
  created_at timestamptz default now()
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender uuid not null,
  content text not null,
  created_at timestamptz default now()
);

-- Taps
create table if not exists public.taps (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null,
  receiver uuid not null,
  type text check (type in ('looking','hot','friendly')) not null default 'hot',
  created_at timestamptz default now()
);

-- Blocks / Reports
create table if not exists public.blocks ( id uuid primary key default gen_random_uuid(), blocker uuid not null, blocked uuid not null, created_at timestamptz default now() );
create table if not exists public.reports ( id uuid primary key default gen_random_uuid(), reporter uuid not null, reported uuid not null, reason text, created_at timestamptz default now() );

-- Views
create or replace view public.public_profiles_view as
select id, username, display_name, age, photo_url, lat, lon, show_distance, is_online, plan
from public.profiles;

-- Nearby RPC
create or replace function public.profiles_nearby(p_lat double precision, p_lon double precision, p_radius_km double precision, p_limit integer default 100)
returns setof public.profiles
language sql stable parallel safe as $$
  select *
  from public.profiles
  where geom is not null
    and st_dwithin(geom, st_setsrid(st_makepoint(p_lon,p_lat),4326)::geography, p_radius_km*1000)
  order by st_distance(geom, st_setsrid(st_makepoint(p_lon,p_lat),4326)::geography)
  limit p_limit;
$$;

-- My conversations RPC (assumes auth.uid())
create or replace function public.my_conversations()
returns table(id uuid, last_message_at timestamptz, other_username text)
language sql stable as $$
  with me as (select auth.uid() as uid),
  conv as (
    select c.id, case when c.a = (select uid from me) then c.b else c.a end as other
    from conversations c
    where c.a = (select uid from me) or c.b = (select uid from me)
  ),
  last_msg as (
    select m.conversation_id, max(m.created_at) as last_message_at
    from messages m group by m.conversation_id
  )
  select conv.id, last_msg.last_message_at, p.username as other_username
  from conv
  join public.profiles p on p.id = conv.other
  left join last_msg on last_msg.conversation_id = conv.id
  order by coalesce(last_msg.last_message_at, 'epoch') desc;
$$;

-- Indexes
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_geom_idx on public.profiles using gist (geom);
create index if not exists messages_conv_idx on public.messages (conversation_id);

-- RLS policies are managed in Supabase dashboard (see README for recommended rules)

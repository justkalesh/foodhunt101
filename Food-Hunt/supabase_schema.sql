-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id text primary key, -- Text to support both Auth UUIDs and Google generic IDs if needed (best to use UUID eventually but text is safe for migration)
  email text unique not null,
  name text,
  semester text,
  role text default 'student',
  is_disabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  loyalty_points integer default 0,
  active_split_id text,
  pfp_url text
);

-- VENDORS TABLE
create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  location text,
  cuisine text,
  origin_tag text,
  rush_level text check (rush_level in ('low', 'mid', 'high')),
  logo_url text,
  menu_image_urls text[], -- Array of strings
  contact_number text,
  lowest_item_price numeric,
  avg_price_per_meal numeric,
  popularity_score integer default 0,
  is_active boolean default true,
  rating_avg numeric default 0,
  rating_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone
);

-- REVIEWS TABLE
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id text references public.users(id),
  vendor_id uuid references public.vendors(id),
  rating integer,
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- MENU ITEMS TABLE
create table public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  name text,
  price numeric,
  is_active boolean default true
);

-- MEAL SPLITS TABLE
create table public.meal_splits (
  id uuid default uuid_generate_v4() primary key,
  creator_id text references public.users(id),
  creator_name text,
  vendor_id uuid references public.vendors(id), -- Optional constraint?
  vendor_name text,
  dish_name text,
  total_price numeric,
  people_needed integer,
  people_joined_ids text[], -- Array of User IDs
  time_note text,
  split_time timestamp with time zone,
  is_closed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- CONVERSATIONS TABLE
create table public.conversations (
  id text primary key, -- "user1_user2"
  participants text[], -- Array of User IDs
  participant_details jsonb, -- Map of user details {id: {name, ...}}
  last_message jsonb, -- {content, sender_id, ...}
  unread_counts jsonb, -- {user_id: count}
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- MESSAGES TABLE
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id text references public.conversations(id) on delete cascade,
  sender_id text references public.users(id),
  receiver_id text references public.users(id),
  content text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- POLICIES (Simple Public Access for Development - WARNING: NOT SECURE)
-- In production, you must use RLS (Row Level Security)

alter table public.users enable row level security;
create policy "Public access" on public.users for all using (true);

alter table public.vendors enable row level security;
create policy "Public access" on public.vendors for all using (true);

alter table public.reviews enable row level security;
create policy "Public access" on public.reviews for all using (true);

alter table public.menu_items enable row level security;
create policy "Public access" on public.menu_items for all using (true);

alter table public.meal_splits enable row level security;
create policy "Public access" on public.meal_splits for all using (true);

alter table public.conversations enable row level security;
create policy "Public access" on public.conversations for all using (true);

alter table public.messages enable row level security;
create policy "Public access" on public.messages for all using (true);

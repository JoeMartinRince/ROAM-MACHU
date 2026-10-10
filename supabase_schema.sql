-- ============================================================
-- ROAM MACHU — SUPABASE COMPLETE DATABASE & STORAGE SCHEMA
-- Paste this into Supabase SQL Editor & click "Run" (Ctrl+Enter)
-- ============================================================

-- 1. POSTS & REELS TABLE
create table if not exists public.posts (
  id text primary key,
  creator text not null default 'anonymous.roamer',
  place_id text not null,
  caption text not null default '',
  kind text not null default 'post' check (kind in ('post', 'reel')),
  image text,
  video text,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  views integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2. PLACE VOTES TABLE (Live Roam Score adjustments)
create table if not exists public.place_votes (
  place_id text primary key,
  score_delta numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- 3. COMMENTS TABLE
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id text not null,
  author text not null default 'roamer',
  body text not null,
  created_at timestamptz not null default now()
);

-- 4. ENABLE ROW LEVEL SECURITY & OPEN ACCESS POLICIES
alter table public.posts enable row level security;
alter table public.place_votes enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Public read posts" on public.posts;
create policy "Public read posts" on public.posts for select using (true);

drop policy if exists "Public insert posts" on public.posts;
create policy "Public insert posts" on public.posts for insert with check (true);

drop policy if exists "Public update posts" on public.posts;
create policy "Public update posts" on public.posts for update using (true);

drop policy if exists "Public read place_votes" on public.place_votes;
create policy "Public read place_votes" on public.place_votes for select using (true);

drop policy if exists "Public upsert place_votes" on public.place_votes;
create policy "Public upsert place_votes" on public.place_votes for insert with check (true);

drop policy if exists "Public update place_votes" on public.place_votes;
create policy "Public update place_votes" on public.place_votes for update using (true);

drop policy if exists "Public read comments" on public.comments;
create policy "Public read comments" on public.comments for select using (true);

drop policy if exists "Public insert comments" on public.comments;
create policy "Public insert comments" on public.comments for insert with check (true);

-- 5. STORAGE BUCKET FOR REELS (VIDEOS) & PHOTOS
insert into storage.buckets (id, name, public)
values ('roam-media', 'roam-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read roam-media" on storage.objects;
create policy "Public read roam-media" on storage.objects
  for select using (bucket_id = 'roam-media');

drop policy if exists "Public upload roam-media" on storage.objects;
create policy "Public upload roam-media" on storage.objects
  for insert with check (bucket_id = 'roam-media');

-- 6. SEED INITIAL REELS & POSTS
insert into public.posts (id, creator, place_id, caption, kind, video, upvotes, downvotes, comments, shares, views)
values
  ('r0', 'chai.nomad', 'alleppey', 'Morning mist on the backwaters — pure magic ✨', 'reel', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 820, 12, 64, 41, 18400),
  ('r1', 'roamwithrahul', 'munnar', 'Driving through the clouds in Munnar 🌫️', 'reel', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 690, 9, 52, 38, 14200),
  ('r2', 'meera.maps', 'varkala', 'Sunset dip from the red cliffs 🌊', 'reel', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 1120, 18, 91, 77, 26500),
  ('r3', 'trekkingtess', 'ladakh', 'Khardung La pass — wind so loud you cannot think 🏔️', 'reel', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 1540, 21, 130, 105, 34900),
  ('r4', 'backpackbinu', 'athirappilly', 'Standing 20 meters from Athirappilly in full roar 💦', 'reel', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 580, 8, 44, 29, 11800)
on conflict (id) do nothing;

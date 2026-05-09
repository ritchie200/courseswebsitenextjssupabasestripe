-- CourseForge schema for Supabase.
-- Run this in a Supabase project, then add only placeholder-free values to local
-- .env.local. Never commit real Supabase, Stripe, or Claude credentials.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('student', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.difficulty_level as enum ('Beginner', 'Intermediate', 'Advanced');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum ('pending', 'paid', 'failed', 'refunded');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  thumbnail_url text not null,
  price_cents integer not null check (price_cents >= 0),
  difficulty public.difficulty_level not null default 'Beginner',
  category text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists modules_course_order_idx
on public.modules(course_id, order_index);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  content text not null,
  video_url text,
  order_index integer not null default 1,
  is_preview boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists lessons_module_order_idx
on public.lessons(module_id, order_index);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_course_idx on public.orders(course_id);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  source_order_id uuid references public.orders(id) on delete set null,
  unique(user_id, course_id)
);

create index if not exists enrollments_user_idx on public.enrollments(user_id);
create index if not exists enrollments_course_idx on public.enrollments(course_id);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx
on public.lesson_progress(user_id);

create table if not exists public.ai_chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_history_user_lesson_idx
on public.ai_chat_history(user_id, lesson_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name',
    'student'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = uid
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.orders enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.ai_chat_history enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id and role = 'student');

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write"
on public.profiles for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "courses_public_read_published" on public.courses;
create policy "courses_public_read_published"
on public.courses for select
using (published = true or public.is_admin(auth.uid()));

drop policy if exists "courses_admin_write" on public.courses;
create policy "courses_admin_write"
on public.courses for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "modules_read_published_or_admin" on public.modules;
create policy "modules_read_published_or_admin"
on public.modules for select
using (
  public.is_admin(auth.uid())
  or exists (
    select 1 from public.courses
    where courses.id = modules.course_id
      and courses.published = true
  )
);

drop policy if exists "modules_admin_write" on public.modules;
create policy "modules_admin_write"
on public.modules for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "lessons_read_preview_enrolled_or_admin" on public.lessons;
create policy "lessons_read_preview_enrolled_or_admin"
on public.lessons for select
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = lessons.module_id
      and c.published = true
      and (
        lessons.is_preview = true
        or exists (
          select 1
          from public.enrollments e
          where e.course_id = c.id
            and e.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "lessons_admin_write" on public.lessons;
create policy "lessons_admin_write"
on public.lessons for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "enrollments_select_own_or_admin" on public.enrollments;
create policy "enrollments_select_own_or_admin"
on public.enrollments for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "lesson_progress_select_own_or_admin" on public.lesson_progress;
create policy "lesson_progress_select_own_or_admin"
on public.lesson_progress for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "lesson_progress_insert_own" on public.lesson_progress;
create policy "lesson_progress_insert_own"
on public.lesson_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "lesson_progress_update_own" on public.lesson_progress;
create policy "lesson_progress_update_own"
on public.lesson_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ai_chat_history_select_own_or_admin" on public.ai_chat_history;
create policy "ai_chat_history_select_own_or_admin"
on public.ai_chat_history for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "ai_chat_history_insert_own" on public.ai_chat_history;
create policy "ai_chat_history_insert_own"
on public.ai_chat_history for insert
with check (auth.uid() = user_id);

-- Promote an instructor manually after creating their account:
-- update public.profiles set role = 'admin' where email = 'instructor@example.com';

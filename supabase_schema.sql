-- =====================================================================
-- 사내 세무 일정 관리 프로그램 - Supabase 데이터베이스 설정 SQL
-- =====================================================================
-- 1. 세무 일정 테이블 (tax_schedules)
create table if not exists public.tax_schedules (
  id text primary key,
  title text not null,
  category text not null,
  due_date date not null,
  description text,
  is_official boolean default false,
  is_important boolean default false,
  reminder_days integer default 3,
  status text default 'upcoming',
  completed boolean default false,
  notes text,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CSV 데이터 누적 저장 테이블 (tax_csv_records)
create table if not exists public.tax_csv_records (
  id uuid default gen_random_uuid() primary key,
  file_name text not null,
  title text not null,
  category text,
  due_date date,
  amount numeric,
  description text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- 3. Row Level Security (RLS) 보안 정책 설정
-- =====================================================================
alter table public.tax_schedules enable row level security;
alter table public.tax_csv_records enable row level security;

-- 인증된 사용자(Authenticated Users)만 읽기/쓰기 허용 정책
create policy "Authenticated users can select tax_schedules"
  on public.tax_schedules for select
  to authenticated
  using (true);

create policy "Authenticated users can insert tax_schedules"
  on public.tax_schedules for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update tax_schedules"
  on public.tax_schedules for update
  to authenticated
  using (true);

create policy "Authenticated users can delete tax_schedules"
  on public.tax_schedules for delete
  to authenticated
  using (true);

-- CSV 레코드 테이블 정책
create policy "Authenticated users can select tax_csv_records"
  on public.tax_csv_records for select
  to authenticated
  using (true);

create policy "Authenticated users can insert tax_csv_records"
  on public.tax_csv_records for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete tax_csv_records"
  on public.tax_csv_records for delete
  to authenticated
  using (true);

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Clients (取引先マスタ)
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Staffs (スタッフマスタ)
create table staffs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  notification_email text,
  role text check (role in ('admin', 'sales', 'worker')) default 'worker',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Cases (案件管理)
create table cases (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  staff_id uuid references staffs(id),
  name text not null,
  status text default '受注前',
  order_date date,
  scheduled_completion_date date,
  work_completion_date date,
  invoice_issue_date date,
  lost_date date,
  memo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Case Details (案件明細)
create table case_details (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  item_name text not null,
  unit_price numeric default 0,
  quantity numeric default 1,
  amount numeric generated always as (unit_price * quantity) stored,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Invoices (請求)
create table invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_no text unique,
  client_id uuid references clients(id),
  issue_date date default current_date,
  total_amount numeric default 0,
  pdf_url text,
  payment_status text default '未入金',
  source_case_ids jsonb, -- 検索用: 元案件IDの配列
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Invoice Items (請求明細)
create table invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  case_detail_id uuid references case_details(id),
  amount numeric not null, -- 請求時の固定金額
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) Policies
-- 開発初期のため、一旦全開放または認証済みユーザーのみ許可の設定を推奨
-- 本番運用前に厳密なポリシーを適用する

alter table clients enable row level security;
alter table staffs enable row level security;
alter table cases enable row level security;
alter table case_details enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- Policy: Allow all authenticated users to read/write (Tentative)
create policy "Allow all authenticated users" on clients for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated users" on staffs for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated users" on cases for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated users" on case_details for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated users" on invoices for all using (auth.role() = 'authenticated');
create policy "Allow all authenticated users" on invoice_items for all using (auth.role() = 'authenticated');

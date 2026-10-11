-- =======================================================================
-- Best Food Cottage — Supabase Database Schema & Row Level Security (RLS)
-- Location: Khadim Ali Road, near Mehtaab Garments, Sialkot, Pakistan
-- Standard Delivery Fee: Rs. 100
-- =======================================================================

-- 1. DELIVERY ZONES TABLE
create table if not exists public.delivery_zones (
    id text primary key,
    name text not null,
    description text default '',
    delivery_fee numeric(10, 2) not null default 100.00 check (delivery_fee >= 0),
    min_order_amount numeric(10, 2) not null default 0 check (min_order_amount >= 0),
    estimated_minutes text not null default '25-35 mins',
    postcodes text[] default '{}',
    keywords text[] default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Seed initial delivery zones (Idempotent)
insert into public.delivery_zones (id, name, description, delivery_fee, min_order_amount, estimated_minutes, postcodes, keywords, is_active)
values 
    ('zone-central', 'Zone 1: Khadim Ali Road & Sialkot City (Standard)', 'Central hub near kitchen, fast hot delivery within 25–35 minutes.', 100.00, 200.00, '25-35 mins', array['51310'], array['khadim ali', 'mehtaab', 'model town', 'rang pura', 'railway road', 'circular road', 'shahabpura', 'defense road', 'hajipura', 'chungi'], true),
    ('zone-cantt-city', 'Zone 2: Sialkot Cantt, Paris Road & City Center', 'Sialkot Cantonment, Saddar Bazar, Paris Road and surrounding sectors.', 100.00, 300.00, '35-45 mins', array['51311', '51320'], array['cantt', 'paris road', 'kashmir road', 'saddar', 'mall road', 'garrison', 'commissioner road'], true),
    ('zone-outer-industrial', 'Zone 3: Outer Sialkot & Industrial Corridors', 'Suburbs, Small Industrial Estate, Daska Road & Ugoki surroundings.', 100.00, 400.00, '45-60 mins', array['51340', '51360'], array['ugoki', 'sambrial', 'daska road', 'small industrial', 'sie', 'airport road', 'gohadpur'], true)
on conflict (id) do update set
    name = excluded.name,
    delivery_fee = excluded.delivery_fee,
    min_order_amount = excluded.min_order_amount,
    is_active = excluded.is_active;

-- 2. CUSTOMER PROFILES TABLE
create table if not exists public.customer_profiles (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    email text unique,
    phone text not null,
    default_address text,
    default_landmark text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. MENU ITEMS TABLE
create table if not exists public.menu_items (
    id text primary key,
    name text not null,
    category text not null,
    price numeric(10, 2) not null check (price >= 0),
    price_status text not null default 'confirmed' check (price_status in ('confirmed', 'pending_owner_confirmation')),
    description text default '',
    image text default '',
    is_available boolean not null default true,
    is_popular boolean not null default false,
    is_special_deal boolean not null default false,
    size text,
    deal_includes text[],
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4. ORDERS TABLE
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null,
    user_id uuid,
    customer_name text not null,
    phone text not null,
    address text not null,
    landmark text,
    notes text,
    delivery_zone_id text references public.delivery_zones(id) on delete set null,
    delivery_zone_name text default 'Sialkot City Delivery',
    subtotal numeric(10, 2) not null check (subtotal >= 0),
    delivery_fee numeric(10, 2) not null default 100.00 check (delivery_fee >= 0),
    total numeric(10, 2) not null check (total >= 0),
    payment_method text not null default 'Cash on Delivery',
    payment_status text not null default 'Unpaid (COD)' check (payment_status in ('Unpaid (COD)', 'Paid on Delivery', 'Cancelled')),
    order_status text not null default 'Pending' check (order_status in ('Pending', 'Accepted', 'Preparing', 'Out for delivery', 'Delivered', 'Rejected')),
    client_idempotency_key text unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. ORDER ITEMS TABLE
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    menu_item_id text,
    item_name text not null,
    unit_price numeric(10, 2) not null check (unit_price >= 0),
    quantity integer not null check (quantity > 0),
    item_subtotal numeric(10, 2) not null check (item_subtotal >= 0),
    created_at timestamptz not null default now()
);

-- 6. REVIEWS TABLE
create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    reviewer_name text not null,
    rating integer not null check (rating between 1 and 5),
    comment text not null,
    status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz not null default now()
);

-- =======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Safe and Idempotent)
-- =======================================================================

alter table public.delivery_zones enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- Drop existing policies first to prevent "policy already exists" errors
drop policy if exists "Public view delivery zones" on public.delivery_zones;
drop policy if exists "Admin manage delivery zones" on public.delivery_zones;
drop policy if exists "Public view menu items" on public.menu_items;
drop policy if exists "Admin manage menu items" on public.menu_items;
drop policy if exists "Public insert orders" on public.orders;
drop policy if exists "Public view orders" on public.orders;
drop policy if exists "Public insert order items" on public.order_items;
drop policy if exists "Public view order items" on public.order_items;
drop policy if exists "Public view reviews" on public.reviews;
drop policy if exists "Public insert reviews" on public.reviews;
drop policy if exists "Customer profiles access" on public.customer_profiles;

-- 1. Delivery Zones Policies
create policy "Public view delivery zones" on public.delivery_zones for select using (true);
create policy "Admin manage delivery zones" on public.delivery_zones for all using (true);

-- 2. Menu Items Policies
create policy "Public view menu items" on public.menu_items for select using (true);
create policy "Admin manage menu items" on public.menu_items for all using (true);

-- 3. Orders Policies
create policy "Public insert orders" on public.orders for insert with check (true);
create policy "Public view orders" on public.orders for select using (true);

-- 4. Order Items Policies
create policy "Public insert order items" on public.order_items for insert with check (true);
create policy "Public view order items" on public.order_items for select using (true);

-- 5. Reviews Policies
create policy "Public view reviews" on public.reviews for select using (status = 'approved');
create policy "Public insert reviews" on public.reviews for insert with check (true);

-- 6. Customer Profiles Policies
create policy "Customer profiles access" on public.customer_profiles for all using (true);

-- =======================================================================
-- SEED INITIAL MENU PRODUCTS (From Official Menu Posters)
-- =======================================================================

insert into public.menu_items (id, name, category, price, price_status, description, is_available, is_popular, is_special_deal, size)
values
    ('piz-lasagna-large', 'Large Lasagna Pizza', 'Special Pizzas', 1399.00, 'confirmed', 'Gourmet lasagna pizza layered with spiced minced chicken, creamy bechamel, and rich melted mozzarella.', true, true, false, 'Large 14"'),
    ('piz-four-flavour-large', 'Four Flavour Pizza', 'Special Pizzas', 1299.00, 'confirmed', 'Four distinct quarters: Chicken Tikka, Fajita, Spicy Ranch, and Veggie Supreme in one large pie.', true, true, false, 'Large 14"'),
    ('deal-azadi-large', 'Azadi Deal Large Pizza', 'Special Pizzas', 1099.00, 'confirmed', 'Special promotional large pizza with double cheese and savory tikka chicken chunks.', true, true, true, 'Large 14"'),
    ('deal-2-zinger-drink', '2 Zinger Burgers + 1 Drink', 'Burgers', 599.00, 'confirmed', '2 crispy fried chicken zinger burgers with garlic mayo, iceberg lettuce + 1 regular cold drink.', true, true, true, 'Deal'),
    ('deal-4-special-zinger', '4 Special Zinger Burgers + 1L Drink', 'Burgers', 1499.00, 'confirmed', '4 special loaded zinger burgers + 1 litre chilled soft drink.', true, true, true, 'Family Deal'),
    ('piz-cottage-special', 'Cottage Special Pizza (Medium 11")', 'Signature Pizza', 1150.00, 'confirmed', 'Cottage special chicken, signature sauce, black olives, mushrooms, jalapenos, sweet corn, and mozzarella.', true, true, false, 'Medium 11"'),
    ('piz-chicken-tikka', 'Chicken Tikka Pizza (Medium 11")', 'Traditional Pizza', 950.00, 'confirmed', 'Traditional BBQ chicken tikka chunks, onion, and 100% dairy mozzarella.', true, true, false, 'Medium 11"'),
    ('piz-chicken-fajita', 'Chicken Fajita Pizza (Medium 11")', 'Traditional Pizza', 950.00, 'confirmed', 'Tender fajita chicken breast, capsicum, onions, and rich melted mozzarella.', true, true, false, 'Medium 11"'),
    ('shw-chicken-shawarma', 'Chicken Shawarma', 'Shawarma & Wraps', 220.00, 'confirmed', 'Slow roasted seasoned shredded chicken, signature garlic tahini mayo, wrapped in soft pita.', true, true, false, 'Regular'),
    ('shw-cheese-shawarma', 'Cheese Chicken Shawarma', 'Shawarma & Wraps', 280.00, 'confirmed', 'Juicy chicken shawarma stuffed with melted cheddar and mozzarella.', true, true, false, 'Regular'),
    ('brg-crispy-zinger', 'Crispy Zinger Burger', 'Burgers', 320.00, 'confirmed', 'Hand-breaded crunchy chicken thigh, fresh iceberg lettuce, garlic mayo on toasted sesame bun.', true, true, false, 'Single'),
    ('fries-masala', 'Crispy Masala Fries', 'Fries', 180.00, 'confirmed', 'Golden fried crinkle potato fries tossed in special cottage spice seasoning.', true, true, false, 'Regular'),
    ('snk-cheese-sticks', 'Chicken Cheese Sticks (4 pcs)', 'Chicken Cheese Stick', 450.00, 'confirmed', 'Crispy golden fried sticks loaded with seasoned minced chicken and stringy melted cheese.', true, true, false, '4 Pcs')
on conflict (id) do update set
    price = excluded.price,
    name = excluded.name,
    category = excluded.category,
    description = excluded.description;

-- Initial sample reviews
insert into public.reviews (reviewer_name, rating, comment, status)
values
    ('Hamza Malik (Sialkot)', 5, 'Best Cottage Special and Lasagna pizza in Sialkot! Piping hot delivery, crisp crust and real cheese pull.', 'approved'),
    ('Ayesha Tariq', 5, '2 Zingers and drink deal is incredible value for money. Very crispy and fresh.', 'approved')
on conflict do nothing;

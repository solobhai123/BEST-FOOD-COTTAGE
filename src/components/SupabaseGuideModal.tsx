import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
}

export const SupabaseGuideModal: React.FC<SupabaseGuideModalProps> = ({
  isOpen,
  onClose,
  isConfigured,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- Best Food Cottage — Supabase Database Setup
-- Run this in Supabase SQL Editor:

-- 1. Delivery Zones Table
create table if not exists public.delivery_zones (
    id text primary key,
    name text not null,
    description text default '',
    delivery_fee numeric(10, 2) not null default 100.00 check (delivery_fee >= 0),
    min_order_amount numeric(10, 2) not null default 0,
    estimated_minutes text not null default '25-35 mins',
    postcodes text[] default '{}',
    keywords text[] default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Menu Items Table
create table if not exists public.menu_items (
    id text primary key,
    name text not null,
    category text not null,
    price numeric(10, 2) not null check (price >= 0),
    price_status text not null default 'confirmed',
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

-- 3. Orders Table
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
    payment_status text not null default 'Unpaid (COD)',
    order_status text not null default 'Pending',
    client_idempotency_key text unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 4. Order Items Table
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

-- 5. Reviews Table
create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    reviewer_name text not null,
    rating integer not null check (rating between 1 and 5),
    comment text not null,
    status text not null default 'approved',
    created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.delivery_zones enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- Safe Idempotent Policies
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

create policy "Public view delivery zones" on public.delivery_zones for select using (true);
create policy "Admin manage delivery zones" on public.delivery_zones for all using (true);
create policy "Public view menu items" on public.menu_items for select using (true);
create policy "Admin manage menu items" on public.menu_items for all using (true);
create policy "Public insert orders" on public.orders for insert with check (true);
create policy "Public view orders" on public.orders for select using (true);
create policy "Public insert order items" on public.order_items for insert with check (true);
create policy "Public view order items" on public.order_items for select using (true);
create policy "Public view reviews" on public.reviews for select using (status = 'approved');
create policy "Public insert reviews" on public.reviews for insert with check (true);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity" />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-heading font-black text-lg">Supabase Database Integration</h2>
              <p className="text-xs text-stone-400">
                Setup guide, schema & live connection status for Best Food Cottage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700">
          {/* Live Status Card */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <span className="font-bold text-sm block">
                {isConfigured ? 'Supabase Live Connected' : 'Supabase Credentials Not Yet Configured in .env'}
              </span>
              <p className="leading-relaxed">
                {isConfigured
                  ? 'The application is actively reading and inserting orders, reviews, and items directly into your real Supabase PostgreSQL instance.'
                  : 'The backend is currently operating on the local server database with atomic transactions, price validation, and duplicate-submission protection. To connect to your real remote Supabase project, follow the 3 steps below.'}
              </p>
            </div>
          </div>

          {/* 3 Steps Guide */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-base text-stone-900">
              How to Connect Your Supabase Project:
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-900 block mb-1">
                  Step 1: Execute SQL Schema in Supabase SQL Editor
                </span>
                <p className="text-stone-600 mb-2">
                  Open your Supabase Project dashboard, go to <strong>SQL Editor</strong>, and run the SQL below to provision <code>menu_items</code>, <code>orders</code>, <code>order_items</code>, and <code>reviews</code> with Row Level Security (RLS).
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Full SQL Script'}</span>
                </button>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-900 block mb-1">
                  Step 2: Add Environment Variables to .env
                </span>
                <p className="text-stone-600 mb-2">
                  In your Project Settings &gt; API, copy the project URL and keys:
                </p>
                <div className="bg-stone-900 text-stone-200 font-mono p-2.5 rounded-lg text-[11px] space-y-1">
                  <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...</div>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <span className="font-bold text-stone-900 block mb-1">
                  Step 3: Future Admin Dashboard (/admin)
                </span>
                <p className="text-stone-600">
                  The application is fully architected so that the owner dashboard at <code>/admin</code> connects to this exact same database to accept/reject orders, update statuses, moderate customer reviews, and edit menu prices.
                </p>
              </div>
            </div>
          </div>

          {/* Quick SQL Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                SQL Schema Preview (supabase-schema.sql)
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-red-800 font-semibold hover:underline flex items-center gap-1"
              >
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
            <pre className="bg-stone-900 text-amber-200/90 font-mono text-[11px] p-3 rounded-xl overflow-x-auto max-h-44 border border-stone-800">
              {sqlCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

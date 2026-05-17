-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  icon text DEFAULT '📦'::text,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  category_id uuid,
  name text NOT NULL,
  barcode text,
  cost_price numeric NOT NULL DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock integer DEFAULT 5,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  store_id uuid,
  full_name text,
  role text CHECK (role = ANY (ARRAY['owner'::text, 'kasir'::text])),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stock_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  change_amount integer NOT NULL,
  type text CHECK (type = ANY (ARRAY['initial'::text, 'restock'::text, 'sale'::text, 'adjustment'::text, 'return'::text])),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stock_logs_pkey PRIMARY KEY (id),
  CONSTRAINT stock_logs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  receipt_footer text DEFAULT 'Terima kasih atas kunjungan Anda!'::text,
  low_stock_threshold integer DEFAULT 5,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT store_settings_pkey PRIMARY KEY (id),
  CONSTRAINT store_settings_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  address text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id),
  CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.transaction_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid,
  product_id uuid,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transaction_items_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid,
  cashier_id uuid,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_amount numeric NOT NULL DEFAULT 0,
  change_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
  CONSTRAINT transactions_cashier_id_fkey FOREIGN KEY (cashier_id) REFERENCES auth.users(id)
);
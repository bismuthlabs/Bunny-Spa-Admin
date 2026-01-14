-- Supabase Business Schema for Bunny Spa Admin
-- Tables: services, staff, clients, sales, payments, expenses, payouts
-- Notes:
--  - Primary keys are UUIDs generated with gen_random_uuid() (Postgres pgcrypto or pgcrypto/gen_random_uuid extension required).
--  - RLS is enabled. Policies use a helper that reads `current_setting('bsa.role', true)` so the application can set the role on the DB session when needed.
--  - The service role key (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS and should be used by server-side routes for admin actions.

-- Enable pgcrypto for uuid generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper: returns the current application role set via SET LOCAL bsa.role = 'owner' (optional)
CREATE OR REPLACE FUNCTION bsa_current_role() RETURNS text AS $$
  SELECT current_setting('bsa.role', true);
$$ LANGUAGE sql STABLE;

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  default_price numeric(10,2) NOT NULL DEFAULT 0,
  default_duration_minutes integer NOT NULL DEFAULT 60,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY services_read FOR SELECT ON services USING (bsa_current_role() IN ('owner','manager','investor'));
CREATE POLICY services_write FOR INSERT, UPDATE, DELETE ON services USING (bsa_current_role() IN ('owner','manager')) WITH CHECK (bsa_current_role() IN ('owner','manager'));

-- STAFF
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'therapist',
  rating numeric(2,1),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_read FOR SELECT ON staff USING (bsa_current_role() IN ('owner','manager','investor'));
CREATE POLICY staff_write FOR INSERT, UPDATE, DELETE ON staff USING (bsa_current_role() IN ('owner','manager')) WITH CHECK (bsa_current_role() IN ('owner','manager'));

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  status text NOT NULL DEFAULT 'new', -- new, regular, vip
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_read FOR SELECT ON clients USING (bsa_current_role() IN ('owner','manager','investor'));
CREATE POLICY clients_write FOR INSERT, UPDATE, DELETE ON clients USING (bsa_current_role() IN ('owner','manager')) WITH CHECK (bsa_current_role() IN ('owner','manager'));

-- SALES (service_sessions)
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number text UNIQUE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  service_date date NOT NULL,
  start_time time,
  end_time time,
  duration_minutes integer,
  location_type text NOT NULL DEFAULT 'In-Shop', -- In-Shop, Home, Hotel
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  balance numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text,
  transport_cost numeric(10,2) DEFAULT 0,
  other_expenses numeric(10,2) DEFAULT 0,
  staff_commission_pct numeric(5,2) DEFAULT 0,
  staff_commission_amount numeric(10,2) DEFAULT 0,
  profit numeric(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'completed', -- completed, cancelled, pending
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sales_service_date_idx ON sales(service_date);
CREATE INDEX IF NOT EXISTS sales_client_id_idx ON sales(client_id);
CREATE INDEX IF NOT EXISTS sales_staff_id_idx ON sales(staff_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY sales_read FOR SELECT ON sales USING (bsa_current_role() IN ('owner','manager','investor'));
CREATE POLICY sales_write FOR INSERT, UPDATE, DELETE ON sales USING (bsa_current_role() IN ('owner','manager')) WITH CHECK (bsa_current_role() IN ('owner','manager'));

-- PAYMENTS (one or more payments per sale)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  method text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_read FOR SELECT ON payments USING (bsa_current_role() IN ('owner','manager','investor'));
CREATE POLICY payments_write FOR INSERT, UPDATE, DELETE ON payments USING (bsa_current_role() IN ('owner','manager')) WITH CHECK (bsa_current_role() IN ('owner','manager'));

-- EXPENSES (general business expenses)
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- oils, towels, transport, supplies, other
  amount numeric(10,2) NOT NULL,
  expense_date date NOT NULL DEFAULT now(),
  notes text,
  sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY expenses_read FOR SELECT ON expenses USING (bsa_current_role() IN ('owner','manager','investor'));
CREATE POLICY expenses_write FOR INSERT, UPDATE, DELETE ON expenses USING (bsa_current_role() IN ('owner','manager')) WITH CHECK (bsa_current_role() IN ('owner','manager'));

-- PAYOUTS (staff payouts / commissions)
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, processed
  scheduled_for date,
  processed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY payouts_read FOR SELECT ON payouts USING (bsa_current_role() IN ('owner','manager'));
CREATE POLICY payouts_write FOR INSERT, UPDATE, DELETE ON payouts USING (bsa_current_role() IN ('owner','manager')) WITH CHECK (bsa_current_role() IN ('owner','manager'));

-- Optional: Simple view for revenue by service
CREATE OR REPLACE VIEW revenue_by_service AS
SELECT
  s.id AS service_id,
  s.name AS service_name,
  SUM(sales.price) AS total_revenue,
  SUM(sales.profit) AS total_profit
FROM services s
LEFT JOIN sales ON sales.service_id = s.id
GROUP BY s.id, s.name;

-- Note: The schema above assumes the application layer enforces authorization from session cookie. The bsa_current_role() helper reads
-- the session-local `bsa.role` setting; to make RLS checks effective, set
-- `SET LOCAL bsa.role = '<role>'` at the start of the DB connection/session or enforce checks within server-side API endpoints.

-- Helpful comment for admins:
-- 1) Run this file in the Supabase SQL editor.
-- 2) Use the service role key for server-side writes/management.
-- 3) Create indexes for any reporting queries you add.

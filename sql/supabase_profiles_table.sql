-- Run this in the Supabase SQL editor

-- 1) Create role enum and profiles table
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'staff',
  active boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);

-- 2) Enable Row Level Security for safety
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Policies
-- Allow a logged-in user to SELECT their own profile (auth_id must match auth.uid())
CREATE POLICY "Select own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = auth_id);

-- Allow the user to update their own profile (limit fields as needed)
CREATE POLICY "Update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Allow the service role (using the SUPABASE_SERVICE_ROLE_KEY) to bypass RLS.
-- Note: service role key bypasses RLS automatically; no policy needed for service role.

-- 4) Example: Insert a profile record for an owner
-- (Preferably set auth_id to the value in auth.users.id for the user if you have it.)
-- Example (replace '<OWNER_EMAIL>' and optionally '<AUTH_USER_ID>'):
-- INSERT INTO public.profiles (auth_id, email, role, active) VALUES ('<AUTH_USER_ID>', '<OWNER_EMAIL>', 'owner', true);

-- 5) Notes:
-- - Disable public sign-ups in Supabase Authentication settings (Dashboard > Authentication > Settings > Disable "Allow new signups").
-- - Configure magic link expiration in Supabase Auth settings (set a short expiry for email links).
-- - Use a SUPABASE_SERVICE_ROLE_KEY in server-side code to send magic links only after verifying a profile is active (see app/api/auth/send-magic-link/route.ts).

-- Run this in Supabase SQL editor to create passcode storage

CREATE TABLE IF NOT EXISTS public.access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  hashed_code text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  rotated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notes:
-- - Passcodes must never be stored in plaintext. Create passcodes on the server using bcrypt and insert the hash into this table.
-- - This table should be managed by trusted admins only. Use the service role key (server-side) to insert rows.
-- - Example insert (replace hashed code):
-- INSERT INTO public.access_codes (role, hashed_code, active) VALUES ('owner', '<BCRYPT_HASH>', true);

# Bunny-Spa-Admin

## Authentication (Supabase)

🔧 This project uses server-verified passcode authentication (no email auth). Admins create bcrypt-hashed access codes and the server issues signed, HTTP-only session cookies.

Important steps and notes:

- Create a `profiles` table in your Supabase project (SQL provided in `sql/supabase_profiles_table.sql`).
- In the Supabase dashboard, disable public sign-ups: Authentication → Settings → turn off **Allow new signups**.
- Add the service role key to your environment as `SUPABASE_SERVICE_ROLE_KEY` (do not commit this key).
- Disable any public sign-up flows in Supabase and ensure only admins manage access codes.

- Admins should create auth users and profiles ahead of time. See `sql/supabase_profiles_table.sql` for an example insert.

Server-side enforcement:

- Magic link authentication has been removed in favor of server-verified passcodes.
- New flow: operators enter a passcode at `/unlock`. The server verifies against bcrypt-hashed codes in `access_codes`, and issues a signed, HTTP-only session cookie (no Supabase Auth sessions are used).
- Role-based routing is implemented via the server cookie (`role`, `issuedAt`, `expiresAt`).
- Admin UI is available at `/dashboard/admin` (owner-only) to create/activate/deactivate profiles and set roles.

Creating users, profiles, and access codes (admin flow):

1. **Add a server SESSION_SECRET**: set `SESSION_SECRET` in your environment (see `.env.local.example`).
2. **Create access codes** either:
   - Use the Admin UI: Sign in as an `owner` and go to `/dashboard/admin` → Access Codes to create a passcode (the server hashes using bcrypt), or
   - Manually insert a bcrypt hash into `access_codes` (use `bcryptjs` locally to generate a hash and insert it via SQL).

Example SQL insert (replace `<BCRYPT_HASH>`):

```sql
INSERT INTO public.access_codes (role, hashed_code, active) VALUES ('owner', '<BCRYPT_HASH>', true);
```

Notes:
- Install dependencies for hashing: `npm install bcryptjs` (server-side hashing uses `bcryptjs`).
- Quick test checklist:
  1. Run `sql/supabase_access_codes_table.sql` in Supabase to create `access_codes` table.
  2. Set `SESSION_SECRET` in `.env.local` and `SUPABASE_SERVICE_ROLE_KEY` (server-only).
  3. Create an owner code using the Admin UI (`/dashboard/admin`) or insert a bcrypt hash into the DB.
  4. Visit `/unlock`, enter the passcode, and verify you are redirected to `/dashboard`.
  5. Try accessing `/dashboard/admin` as non-owner — you should be redirected to `/unlock`.
- The unlock flow (`/unlock`) only requires a passcode; no email, no magic link, and no Supabase Auth sessions are used.


Security notes:

- Using the service role key server-side prevents account enumeration and prevents public sign-up via client-side calls.
- Server-issued signed cookies expire per `SESSION_TTL_SECONDS` and are validated on each server request. Keep `SESSION_SECRET` secret and rotate periodically.


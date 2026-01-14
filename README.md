# Bunny-Spa-Admin

## Authentication (Supabase)

🔧 This project uses Supabase passwordless (email magic link) authentication with additional controls.

Important steps and notes:

- Create a `profiles` table in your Supabase project (SQL provided in `sql/supabase_profiles_table.sql`).
- In the Supabase dashboard, disable public sign-ups: Authentication → Settings → turn off **Allow new signups**.
- Add the service role key to your environment as `SUPABASE_SERVICE_ROLE_KEY` (do not commit this key).
- Configure magic link expiry in Supabase Auth settings to a short lifetime (e.g., 10 minutes) to limit link duration.
- Add `https://your-app-url/auth/callback` (or `http://localhost:3000/auth/callback` in dev) to **Redirect URLs** in the Supabase Authentication settings.

- Admins should create auth users and profiles ahead of time. See `sql/supabase_profiles_table.sql` for an example insert.

Server-side enforcement:

- The app sends magic links using a server-only endpoint (`POST /api/auth/send-magic-link`) which will only send a link if an active profile exists for the email.
- The callback at `/auth/callback` checks that the logged-in user has an active `profiles` entry and redirects based on role (`owner` → `/dashboard`, `manager` → `/dashboard?view=ops`).

Creating users and profiles (recommended admin flow):

1. Create an auth user using the Supabase dashboard (Authentication → Users) or via the Admin API (example using the service role key):

```js
import { createClient } from '@supabase/supabase-js'
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
await supabaseAdmin.auth.admin.createUser({ email: 'alice@example.com', email_confirm: true })
```

2. Insert a matching row into `profiles` (you can set `auth_id` to the created user's id):

```sql
INSERT INTO public.profiles (auth_id, email, role, active) VALUES ('<AUTH_USER_ID>', 'alice@example.com', 'owner', true);
```

This ensures that only pre-created accounts can receive magic links and sign in.

Security notes:

- Using the service role key server-side prevents account enumeration and prevents public sign-up via client-side calls.
- Magic links are time-limited by Supabase settings; they are consumed once when used to create a session (single-use by design).


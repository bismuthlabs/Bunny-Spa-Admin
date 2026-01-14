Magic link (passwordless) authentication has been removed.

Files that were deprecated or removed:
- `app/api/auth/send-magic-link/route.ts` — replaced with a 410 Gone endpoint.
- `app/auth/callback/page.tsx` — deprecated; redirects to `/unlock`.
- `app/auth/login/page.tsx` — replaced by `/unlock` page.

If you need to re-enable magic link auth, carefully review the previous implementation and ensure public signups are disabled and email redirect URLs are configured.

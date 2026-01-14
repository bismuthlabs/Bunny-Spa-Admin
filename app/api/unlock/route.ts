import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { createSessionCookie } from '@/lib/session'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const DEFAULT_TTL = (process.env.SESSION_TTL_SECONDS ? parseInt(process.env.SESSION_TTL_SECONDS, 10) : 3600)
// Optional: longer TTL for remember-me. Configure via env var; default fallback is 24x DEFAULT_TTL
const REMEMBER_TTL = (process.env.SESSION_TTL_REMEMBER_SECONDS ? parseInt(process.env.SESSION_TTL_REMEMBER_SECONDS, 10) : DEFAULT_TTL * 24)

export async function POST(req: Request) {
  try {
    const { passcode, rememberMe } = await req.json()
    if (!passcode || typeof passcode !== 'string') return NextResponse.json({ error: 'Missing passcode' }, { status: 400 })

    // Fetch active codes
    const { data: codes, error } = await supabaseAdmin.from('access_codes').select('id, role, hashed_code, active').eq('active', true)
    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    for (const c of codes || []) {
      try {
        const match = await bcrypt.compare(passcode, c.hashed_code)
        if (match) {
          const issuedAt = Date.now()
          // Choose ttl based on rememberMe flag (server-side only)
          const ttl = rememberMe === true ? REMEMBER_TTL : DEFAULT_TTL
          const expiresAt = issuedAt + ttl * 1000
          const payload = { role: c.role, issuedAt, expiresAt }

          const res = NextResponse.json({ ok: true, role: c.role })
          // Use TTL value to set Max-Age on the cookie
          createSessionCookie(res, payload, ttl)
          return res
        }
      } catch (err) {
        console.warn('bcrypt compare failed', err)
      }
    }

    return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

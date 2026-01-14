import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env var')
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

import { parseSessionFromRequest } from '@/lib/session'

async function requireOwner(req: Request) {
  const payload = parseSessionFromRequest(req)
  if (!payload) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (payload.role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (payload.expiresAt < Date.now()) return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  return null
}

export async function GET(req: Request) {
  const deny = await requireOwner(req)
  if (deny) return deny

  const { data, error } = await supabaseAdmin.from('access_codes').select('id, role, active, created_at, rotated_at')
  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  // Create a new access code (server-side hashes the passcode)
  const deny = await requireOwner(req)
  if (deny) return deny

  const body = await req.json()
  const { role, passcode, active } = body || {}
  if (!role || !passcode) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const hashed = await bcrypt.hash(passcode, 12)
  const { data, error } = await supabaseAdmin.from('access_codes').insert({ role, hashed_code: hashed, active: active === undefined ? true : !!active }).select().single()
  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  return NextResponse.json({ data })
}
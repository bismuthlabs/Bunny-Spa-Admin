import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
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
  // List profiles (only for owners)
  const deny = await requireOwner(req)
  if (deny) return deny

  const { data, error } = await supabaseAdmin.from('profiles').select('id, email, role, active, created_at, last_login').order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  // Create a new profile + optionally create auth user via service role
  const deny = await requireOwner(req)
  if (deny) return deny

  const body = await req.json()
  const email = (body?.email || '').toString().trim().toLowerCase()
  const role = body?.role || 'staff'
  const active = body?.active === undefined ? true : !!body.active

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    // Create auth user if desired (admin action) - use admin API createUser
    let authId = null
    if (body?.createAuthUser) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({ email: email, email_confirm: true })
      if (createErr) {
        console.warn('Failed to create auth user', createErr)
      } else {
        // created is { user }
        authId = (created?.user as any)?.id ?? null
      }
    }

    const { data, error } = await supabaseAdmin.from('profiles').insert({ auth_id: authId, email, role, active }).select().single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

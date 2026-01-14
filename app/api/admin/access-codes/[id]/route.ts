import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const deny = await requireOwner(req)
  if (deny) return deny

  const id = params.id
  const body = await req.json()
  const updates: any = {}
  if (typeof body.active === 'boolean') updates.active = body.active
  if (typeof body.role === 'string') updates.role = body.role

  const { data, error } = await supabaseAdmin.from('access_codes').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const deny = await requireOwner(req)
  if (deny) return deny

  const id = params.id
  const { error } = await supabaseAdmin.from('access_codes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
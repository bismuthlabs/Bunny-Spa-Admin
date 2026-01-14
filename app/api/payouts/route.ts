import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { parseSessionFromRequest } from "@/lib/session"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export async function GET(req: Request) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["owner", "manager"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data, error } = await supabaseAdmin.from('payouts').select('id, staff_id, amount, status, scheduled_for, processed_at, notes, created_at').order('created_at', { ascending: false }).limit(200)
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["owner", "manager"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { staff_id, amount, scheduled_for, notes } = body
    if (!staff_id || !amount) return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('payouts').insert({ staff_id, amount, scheduled_for, notes }).select('*').single()
    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id, data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
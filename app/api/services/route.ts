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
    // allow all roles to read services
    if (!["owner", "manager", "investor"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data, error } = await supabaseAdmin.from("services").select("id, name, default_price, default_duration_minutes").eq("active", true).order("name")
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["owner", "manager"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { name, description, default_price = 0, default_duration_minutes = 60 } = body
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert({ name, description, default_price, default_duration_minutes })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id, data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

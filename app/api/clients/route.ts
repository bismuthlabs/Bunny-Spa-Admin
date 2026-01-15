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
    if (!["owner", "manager", "investor"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Aggregated client info: visits, total_spent, last_visit
    const { data, error } = await supabaseAdmin.rpc('get_clients_with_stats')

    // If the RPC is not present in DB, fall back to a simple select + aggregation in JS
    if (error) {
      const { data: simple } = await supabaseAdmin
        .from('clients')
        .select('id, name, phone, email, status')
        .order('name')

      // compute simple stats in JS
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = now.toISOString().split('T')[0]

      const enriched = await Promise.all((simple || []).map(async (c: any) => {
        const { data: agg } = await supabaseAdmin.from('sales').select('amount_paid, service_date').eq('client_id', c.id)
        const total_spent = (agg && agg.reduce((sum: number, row: any) => sum + Number(row.amount_paid || 0), 0)) || 0
        const visits = (agg && agg.length) || 0
        const last_visit = (agg && agg.length > 0 && agg[agg.length - 1].service_date) || null

        // month-scoped aggregates (this month)
        const { data: monthAgg } = await supabaseAdmin.from('sales').select('amount_paid').eq('client_id', c.id).gte('service_date', startOfMonth).lte('service_date', endOfMonth).eq('status', 'completed')
        const total_spent_month = (monthAgg && monthAgg.reduce((sum: number, row: any) => sum + Number(row.amount_paid || 0), 0)) || 0
        const visits_month = (monthAgg && monthAgg.length) || 0

        return { ...c, total_spent, visits, last_visit, total_spent_month, visits_month }
      }))

      return NextResponse.json({ data: enriched })
    }

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
    const { name, phone, email, status = "new" } = body
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('clients').insert({ name, phone, email, status }).select('*').single()
    if (error) throw error
    return NextResponse.json({ ok: true, id: data.id, data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["owner", "manager"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const url = new URL(req.url)
    const clientId = url.searchParams.get("id")
    if (!clientId) return NextResponse.json({ error: "Missing client ID" }, { status: 400 })

    const { error } = await supabaseAdmin.from("clients").delete().eq("id", clientId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

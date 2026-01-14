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

    const { data, error } = await supabaseAdmin.from("staff").select("id, name, role, rating, active").eq("active", true).order("name")
    if (error) throw error

    // enrich with simple month-scoped aggregates (services completed, total commission this month)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = now.toISOString().split('T')[0]

    const enriched = await Promise.all((data || []).map(async (s: any) => {
      const { data: sales } = await supabaseAdmin
        .from('sales')
        .select('staff_commission_amount')
        .eq('staff_id', s.id)
        .gte('service_date', startOfMonth)
        .lte('service_date', endOfMonth)
        .eq('status', 'completed')

      const services = sales ? sales.length : 0
      const commission = sales ? sales.reduce((sum, item) => sum + (Number(item.staff_commission_amount) || 0), 0) : 0
      return { ...s, services, commission }
    }))

    return NextResponse.json({ data: enriched })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

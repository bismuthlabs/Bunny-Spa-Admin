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

    // Revenue by service
    const { data: rbs } = await supabaseAdmin.from("revenue_by_service").select("service_id, service_name, total_revenue, total_profit")

    // Revenue by staff (grouped sum)
    const rbsfResp: any = await (supabaseAdmin as any)
      .from("sales")
      .select("staff(id, name), sum(price)")
      .group("staff.id, staff.name")
    const rbsfRaw = rbsfResp?.data || []

    const rbsf = (rbsfRaw || []).map((r: any) => ({
      staff: r.staff || null,
      total_revenue: Number(r.sum || 0),
    }))

    // Location breakdown (sum by location)
    const locResp: any = await (supabaseAdmin as any).from("sales").select("location_type, sum(price)").group("location_type")
    const locRaw = locResp?.data || []
    const loc = (locRaw || []).map((l: any) => ({ location_type: l.location_type, value: Number(l.sum || 0) }))

    // Outstanding balances and services completed
    const balancesResp: any = await (supabaseAdmin as any).from('sales').select('sum(balance)')
    const balances = balancesResp?.data || []
    const { count: completedCount } = await supabaseAdmin.from('sales').select('id', { count: 'exact' }).eq('status', 'completed')

    const outstandingBalance = balances && balances[0] ? Number(balances[0].sum || 0) : 0
    const servicesCompleted = completedCount || 0

    // Average service value and profit margin (separate aggregations)
    const { data: avgRes } = await supabaseAdmin.from('sales').select('avg(price)')
    const { data: totalProfitRes } = await supabaseAdmin.from('sales').select('sum(profit)')
    const { data: totalRevenueRes } = await supabaseAdmin.from('sales').select('sum(price)')

    const avgServiceValue = avgRes && avgRes[0] ? Number(avgRes[0].avg || 0) : 0
    const totalProfit = totalProfitRes && totalProfitRes[0] ? Number(totalProfitRes[0].sum || 0) : 0
    const totalRevenue = totalRevenueRes && totalRevenueRes[0] ? Number(totalRevenueRes[0].sum || 0) : 0
    const profitMargin = totalRevenue ? Math.round((totalProfit / totalRevenue) * 100) : 0

    // Simple utilization approximation: completed services per staff per day over last 30 days
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const { data: completedRows } = await supabaseAdmin
      .from('sales')
      .select('id, staff_id')
      .gte('service_date', since.toISOString().split('T')[0])
      .eq('status', 'completed')

    const { data: staffCount } = await supabaseAdmin.from('staff').select('id').eq('active', true)

    const completedCountNum = completedRows ? completedRows.length : 0
    const staffCnt = staffCount ? staffCount.length || 1 : 1
    const utilizationRate = Math.round((completedCountNum / (staffCnt * 30)) * 100)

    return NextResponse.json({
      revenueByService: rbs || [],
      revenueByStaff: rbsf || [],
      locationData: loc || [],
      outstandingBalance,
      servicesCompleted,
      keyMetrics: {
        avgServiceValue: Math.round(avgServiceValue),
        profitMargin,
        utilizationRate,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

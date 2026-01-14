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

    // Compute a 'this month' window (start of month -> today)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = now.toISOString().split('T')[0]

    // Aggregate totals for the current month (only completed services)
    const { data: totalRevenueRes } = await supabaseAdmin
      .from('sales')
      .select('sum(price)')
      .gte('service_date', startOfMonth)
      .lte('service_date', endOfMonth)
      .eq('status', 'completed')

    const { data: totalProfitRes } = await supabaseAdmin
      .from('sales')
      .select('sum(profit)')
      .gte('service_date', startOfMonth)
      .lte('service_date', endOfMonth)
      .eq('status', 'completed')

    // Note: compute totals directly from the data we fetch below to avoid SDK aggregate issues
    // totalRevenueMonth and totalProfitMonth will be summed from svcRows after we fetch them

    // Services completed this month
    const { count: completedCount } = await supabaseAdmin
      .from('sales')
      .select('id', { count: 'exact' })
      .gte('service_date', startOfMonth)
      .lte('service_date', endOfMonth)
      .eq('status', 'completed')

    // Outstanding balances (all time) - sum of outstanding balances on sales
    const { data: balancesResp } = await supabaseAdmin.from('sales').select('sum(balance)')
    const outstandingBalance = balancesResp && balancesResp[0] ? Number(balancesResp[0].sum || 0) : 0

    // Revenue by service for the month: fetch service info and aggregate in JS to avoid complex SQL group aliasing
    const { data: svcRows } = await supabaseAdmin
      .from('sales')
      .select('service_id, services!left(id, name), price, profit')
      .gte('service_date', startOfMonth)
      .lte('service_date', endOfMonth)
      .eq('status', 'completed')
      .limit(5000)

    const rbsMap: Record<string, { service_id: string; service_name: string; total_revenue: number; total_profit: number }> = {}
    let totalRevenueMonth = 0
    let totalProfitMonth = 0
    let sumForAvg = 0
    let countForAvg = 0

    ;(svcRows || []).forEach((row: any) => {
      const svcId = String(row.service_id)
      const svcName = (row.services && row.services.name) || 'Unknown'
      if (!rbsMap[svcId]) rbsMap[svcId] = { service_id: svcId, service_name: svcName, total_revenue: 0, total_profit: 0 }
      
      const price = Number(row.price || 0)
      const profit = Number(row.profit || 0)
      
      rbsMap[svcId].total_revenue += price
      rbsMap[svcId].total_profit += profit
      
      // Also accumulate for totals and average
      totalRevenueMonth += price
      totalProfitMonth += profit
      sumForAvg += price
      countForAvg += 1
    })

    const rbs = Object.values(rbsMap)

    // Compute average service value from accumulated sums
    const avgServiceValue = countForAvg > 0 ? sumForAvg / countForAvg : 0

    // Revenue by staff for the month
    const { data: staffRows } = await supabaseAdmin
      .from('sales')
      .select('staff_id, staff!left(id, name), price')
      .gte('service_date', startOfMonth)
      .lte('service_date', endOfMonth)
      .eq('status', 'completed')
      .limit(5000)

    const rbsfMap: Record<string, { staff: any; total_revenue: number }> = {}
    ;(staffRows || []).forEach((row: any) => {
      const sid = String(row.staff_id || 'unassigned')
      const sname = (row.staff && row.staff.name) || 'Unknown'
      if (!rbsfMap[sid]) rbsfMap[sid] = { staff: { id: sid, name: sname }, total_revenue: 0 }
      rbsfMap[sid].total_revenue += Number(row.price || 0)
    })

    const rbsf = Object.values(rbsfMap)

    // Location breakdown for the month
    const { data: locRows } = await supabaseAdmin
      .from('sales')
      .select('location_type, price')
      .gte('service_date', startOfMonth)
      .lte('service_date', endOfMonth)
      .eq('status', 'completed')
      .limit(5000)

    const locMap: Record<string, number> = {}
    ;(locRows || []).forEach((r: any) => {
      const key = r.location_type || 'Unknown'
      locMap[key] = (locMap[key] || 0) + Number(r.price || 0)
    })

    const loc = Object.keys(locMap).map((k) => ({ location_type: k, value: locMap[k] }))

    // Simple utilization approximation: completed services per staff per day over last 30 days
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const { data: completedRows30 } = await supabaseAdmin
      .from('sales')
      .select('id, staff_id')
      .gte('service_date', since.toISOString().split('T')[0])
      .eq('status', 'completed')

    const { data: staffCount } = await supabaseAdmin.from('staff').select('id').eq('active', true)

    const completedCountNum = completedRows30 ? completedRows30.length : 0
    const staffCnt = staffCount ? staffCount.length || 1 : 1
    const utilizationRate = Math.round((completedCountNum / (staffCnt * 30)) * 100)

    return NextResponse.json({
      // Month-scoped aggregations (suitable for dashboard monthly KPIs)
      month: { start: startOfMonth, end: endOfMonth },
      totalRevenueMonth,
      totalProfitMonth,
      revenueByService: rbs,
      revenueByStaff: rbsf,
      locationData: loc,
      outstandingBalance,
      servicesCompleted: completedCount || 0,
      keyMetrics: {
        avgServiceValue: Math.round(avgServiceValue),
        profitMargin: totalRevenueMonth ? Math.round((totalProfitMonth / totalRevenueMonth) * 100) : 0,
        utilizationRate,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { parseSessionFromRequest } from "@/lib/session"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// GET: list recent sales (limit 50)
export async function GET(req: Request) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    // allow owner/manager/investor to read
    if (!["owner", "manager", "investor"].includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from("sales")
      .select(
        `id, sale_number, service_date, start_time, end_time, duration_minutes, location_type, price, discount, amount_paid, balance, payment_method, transport_cost, other_expenses, staff_commission_pct, staff_commission_amount, profit, status, notes, created_at, services!left(id, name), clients!left(id, name), staff!left(id, name)`,
      )
      .order("service_date", { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}

// POST: create a sale (owner/manager only)
export async function POST(req: Request) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["owner", "manager"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    // Basic, conservative validation. Caller should send service_id, client_id, staff_id
    const {
      service_id,
      client_id,
      staff_id,
      service_date,
      start_time,
      end_time,
      price,
      discount = 0,
      amount_paid,
      payment_method,
      location_type = "In-Shop",
      transport_cost = 0,
      other_expenses = 0,
      staff_commission_pct = 0,
      notes,
      status = "completed",
    } = body

    if (!service_date || !service_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const staff_commission_amount = ((Number(price) || 0) * Number(staff_commission_pct || 0)) / 100
    const profit = (Number(amount_paid) || 0) - Number(staff_commission_amount) - Number(transport_cost || 0) - Number(other_expenses || 0)
    const balance = (Number(price) || 0) - (Number(amount_paid) || 0)

    const insertObj: any = {
      service_id,
      client_id,
      staff_id,
      service_date,
      start_time,
      end_time,
      duration_minutes: null,
      location_type,
      price,
      discount,
      amount_paid,
      balance,
      payment_method,
      transport_cost,
      other_expenses,
      staff_commission_pct,
      staff_commission_amount,
      profit,
      status,
      notes,
    }

    const { data, error } = await supabaseAdmin.from("sales").insert(insertObj).select("id").single()
    if (error) throw error

    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE: delete a sale by ID (owner/manager only)
export async function DELETE(req: Request) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["owner", "manager"].includes(payload.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const url = new URL(req.url)
    const saleId = url.searchParams.get("id")
    if (!saleId) return NextResponse.json({ error: "Missing sale ID" }, { status: 400 })

    const { error } = await supabaseAdmin.from("sales").delete().eq("id", saleId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

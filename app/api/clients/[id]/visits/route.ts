import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { parseSessionFromRequest } from "@/lib/session"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const payload = parseSessionFromRequest(req)
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    if (!["owner", "manager", "investor"].includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const clientId = params.id
    if (!clientId) return NextResponse.json({ error: "Missing client ID" }, { status: 400 })

    // Fetch recent visits for this client (limit 20, sorted by date descending)
    const { data, error } = await supabaseAdmin
      .from("sales")
      .select("id, service_date, services!left(name), price, status")
      .eq("client_id", clientId)
      .order("service_date", { ascending: false })
      .limit(20)

    if (error) throw error

    const visits = (data || []).map((row: any) => ({
      id: row.id,
      service_date: row.service_date,
      service_name: row.services?.name || "Unknown Service",
      price: Number(row.price || 0),
      status: row.status || "completed",
    }))

    return NextResponse.json({ visits })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

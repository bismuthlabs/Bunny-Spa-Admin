import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function requireOwner() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const email = session.user.email
  const { data: profile } = await supabase.from("profiles").select("role, active").eq("email", email).limit(1).maybeSingle()

  if (!profile || profile.role !== "owner" || !profile.active) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const deny = await requireOwner()
  if (deny) return deny

  const id = params.id
  const body = await req.json()
  const updates: any = {}
  if (typeof body.active === "boolean") updates.active = body.active
  if (typeof body.role === "string") updates.role = body.role
  if (typeof body.email === "string") updates.email = body.email.trim().toLowerCase()

  try {
    const { data, error } = await supabaseAdmin.from("profiles").update(updates).eq("id", id).select().single()
    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const deny = await requireOwner()
  if (deny) return deny

  const id = params.id
  try {
    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}

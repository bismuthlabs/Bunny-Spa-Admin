import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = (body?.email || "").toString().trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    // Check the internal profiles table for an active account
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, active")
      .eq("email", email)
      .limit(1)
      .single()

    // For security do not leak whether the email exists. Return success for both cases
    // but only send an actual magic link if profile exists and is active.
    if (!profile || profileError || !profile.active) {
      return NextResponse.json({ ok: true })
    }

    // Send magic link using the server key (service role key). This prevents public signup
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/callback`,
      },
    })

    if (error) {
      console.error("Error sending magic link:", error)
      // Don't leak internals to the client
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallbackPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?error=invalid_session")
  }

  const email = session.user?.email

  if (!email) {
    // no email, force sign out
    try {
      await supabase.auth.signOut()
    } catch (err) {
      // ignore
    }
    redirect("/auth/login?error=invalid_session")
  }

  // Verify the user exists in the internal profiles table and is active
  const { data: profile, error } = await supabase.from("profiles").select("role, active").eq("email", email).limit(1).maybeSingle()

  if (error || !profile || !profile.active) {
    // Block login, sign the user out and show a neutral error
    try {
      await supabase.auth.signOut()
    } catch (err) {
      // ignore
    }

    redirect("/auth/login?error=not_authorized")
  }

  // Update last_login and redirect based on role
  try {
    await supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("email", email)
  } catch (err) {
    // ignore errors updating last_login
  }

  const role = profile.role
  if (role === "owner") {
    redirect("/dashboard")
  } else if (role === "manager") {
    // operational manager view
    redirect("/dashboard?view=ops")
  } else {
    redirect("/dashboard")
  }
}


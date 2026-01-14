import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminProfiles from "@/components/admin-profiles"

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user?.email) {
    redirect("/auth/login")
  }

  const email = session.user.email
  const { data: profile, error } = await supabase.from("profiles").select("role, active").eq("email", email).limit(1).maybeSingle()

  if (error || !profile || !profile.active || profile.role !== "owner") {
    // not authorized, send to main dashboard
    redirect("/dashboard?error=not_authorized")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin — Manage Profiles</h1>
      {/* Client component does the real work */}
      <AdminProfiles />
    </div>
  )
}

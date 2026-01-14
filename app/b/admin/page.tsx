import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { parseSessionFromRequest } from "@/lib/session"
import AdminProfiles from "@/components/admin-profiles"
import AdminAccessCodes from "@/components/admin-access-codes"

export default async function AdminPage() {
  // Check our server-side session cookie
  const cookieStore = cookies()
  const cookieHeader = (await cookieStore).getAll().map((c) => `${c.name}=${c.value}`).join('; ')
  const req = new Request('http://localhost', { headers: { cookie: cookieHeader } })
  const session = parseSessionFromRequest(req)

  if (!session || session.expiresAt < Date.now() || session.role !== 'owner') {
    redirect('/unlock')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Manage Profiles & Access Codes</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div><AdminProfiles /></div>
        <div><AdminAccessCodes /></div>
      </div>
    </div>
  )
}

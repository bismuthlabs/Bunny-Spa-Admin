"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, AlertTriangle } from "lucide-react"

type Profile = {
  id: string
  email: string
  role: string
  active: boolean
  created_at?: string
  last_login?: string | null
}

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("staff")
  const [createAuthUser, setCreateAuthUser] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"delete" | "promote" | null>(null)
  const [target, setTarget] = useState<Profile | null>(null)

  const fetchProfiles = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/profiles`)
      const json = await res.json()
      if (res.ok) setProfiles(json.data || [])
      else setError(json.error || "Failed to load")
    } catch (err) {
      setError("Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/admin/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, createAuthUser }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Failed to create")
      } else {
        setEmail("")
        setSuccess("Profile created")
        await fetchProfiles()
      }
    } catch (err) {
      setError("Failed to create")
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    setError("")
    setSuccess("")
    try {
      await fetch(`/api/admin/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      })
      setSuccess(active ? "Activated" : "Deactivated")
      await fetchProfiles()
    } catch (err) {
      setError("Update failed")
    }
  }

  const setRoleFor = async (id: string, newRole: string) => {
    setError("")
    setSuccess("")
    try {
      await fetch(`/api/admin/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      setSuccess("Role updated")
      await fetchProfiles()
    } catch (err) {
      setError("Update failed")
    }
  }

  const confirmDelete = async () => {
    if (!target) return
    setError("")
    try {
      const res = await fetch(`/api/admin/profiles/${target.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setSuccess("Profile deleted")
      setDialogOpen(false)
      setTarget(null)
      await fetchProfiles()
    } catch (err) {
      setError("Delete failed")
    }
  }

  const openDeleteDialog = (p: Profile) => {
    setTarget(p)
    setDialogType("delete")
    setDialogOpen(true)
  }

  const openPromoteDialog = (p: Profile) => {
    setTarget(p)
    setDialogType("promote")
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Create profile</h2>
        <form className="mt-3 flex flex-wrap gap-2 items-center" onSubmit={handleCreate}>
          <div className="w-60">
            <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <Select value={role} onValueChange={(v) => setRole(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">owner</SelectItem>
              <SelectItem value="manager">manager</SelectItem>
              <SelectItem value="staff">staff</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={createAuthUser} onChange={(e) => setCreateAuthUser(e.target.checked)} />
            create auth user
          </label>

          <Button type="submit">Create</Button>
        </form>

        {error && (
          <div className="mt-2">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {success && (
          <div className="mt-2">
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Profiles</h2>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="w-full border-collapse mt-3 text-sm">
            <thead>
              <tr className="text-left border-b"><th>Email</th><th>Role</th><th>Active</th><th>Last Login</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b align-top">
                  <td className="py-2">{p.email}</td>
                  <td className="py-2">
                    <Select value={p.role} onValueChange={(v) => {
                      // If promoting to owner, ask for confirmation
                      if (v === "owner" && p.role !== "owner") {
                        // open confirm
                        openPromoteDialog(p)
                      } else {
                        setRoleFor(p.id, v)
                      }
                    }}>
                      <SelectTrigger size="sm" className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">owner</SelectItem>
                        <SelectItem value="manager">manager</SelectItem>
                        <SelectItem value="staff">staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={p.active} onChange={(e) => toggleActive(p.id, e.target.checked)} />
                      <span className="text-sm">{p.active ? "Active" : "Inactive"}</span>
                    </label>
                  </td>
                  <td className="py-2">{p.last_login ? new Date(p.last_login).toLocaleString() : "—"}</td>
                  <td className="py-2">
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(p)}>
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "delete" ? "Confirm delete" : "Confirm role change"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "delete" ? (
                <>
                  <div className="flex items-center gap-2"><AlertTriangle /> Delete this profile? This action cannot be undone.</div>
                  <div className="text-sm text-muted-foreground mt-2">{target?.email}</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2"><AlertTriangle /> Make this user an owner? This grants full access.</div>
                  <div className="text-sm text-muted-foreground mt-2">{target?.email}</div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {dialogType === "delete" ? (
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            ) : (
              <Button variant="destructive" onClick={async () => {
                if (!target) return
                await setRoleFor(target.id, "owner")
                setDialogOpen(false)
                setTarget(null)
              }}>
                Promote to owner
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

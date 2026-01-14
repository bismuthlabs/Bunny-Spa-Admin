"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Code = { id: string; role: string; active: boolean; created_at?: string }

export default function AdminAccessCodes() {
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(false)
  const [pass, setPass] = useState("")
  const [role, setRole] = useState("manager")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchCodes = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch('/api/admin/access-codes')
      const json = await res.json()
      if (res.ok) setCodes(json.data || [])
      else setError(json.error || 'Failed')
    } catch (err) {
      setError('Failed')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchCodes() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/admin/access-codes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, passcode: pass }) })
      const json = await res.json()
      if (!res.ok) setError(json.error || 'Failed')
      else { setPass(''); setSuccess('Code created'); await fetchCodes() }
    } catch (err) { setError('Failed') }
  }

  const del = async (id: string) => {
    if (!confirm('Delete code?')) return
    try {
      const res = await fetch(`/api/admin/access-codes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Fail')
      setSuccess('Deleted')
      await fetchCodes()
    } catch (err) { setError('Failed to delete') }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Create Access Code</h3>
        <form className="mt-2 flex gap-2 items-center" onSubmit={create}>
          <Input placeholder="passcode" value={pass} onChange={(e) => setPass(e.target.value)} />
          <Select value={role} onValueChange={(v) => setRole(v)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">owner</SelectItem>
              <SelectItem value="manager">manager</SelectItem>
              <SelectItem value="investor">investor</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Create</Button>
        </form>
        {error && <div className="mt-2"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></div>}
        {success && <div className="mt-2"><Alert><AlertDescription>{success}</AlertDescription></Alert></div>}
      </div>

      <div>
        <h3 className="text-lg font-semibold">Existing Codes</h3>
        {loading ? <div>Loading…</div> : (
          <table className="w-full mt-2 text-sm border-collapse">
            <thead><tr className="border-b"><th>Role</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} className="border-b"><td className="py-2">{c.role}</td><td>{String(c.active)}</td><td>{c.created_at}</td><td><button className="text-red-600" onClick={() => del(c.id)}>Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

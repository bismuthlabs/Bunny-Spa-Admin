"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function UnlockPage() {
  const [passcode, setPasscode] = useState("")
  const [showPass, setShowPass] = useState(false) // show/hide toggle
  const [rememberMe, setRememberMe] = useState(false) // longer session when checked
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, rememberMe }), // send rememberMe flag
      })
      const json = await res.json()
      if (!res.ok) {
        // Clear passcode field and focus for quick retry
        setPasscode("")
        setError(json.error || 'Invalid passcode. Please try again.')
        const el = document.getElementById('passcode') as HTMLInputElement | null
        el?.focus()
      } else {
        // Perform a hard navigation so the newly-set HttpOnly cookie is included in the next request
        window.location.assign('/b')
      }
    } catch (err) {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unlock</CardTitle>
          <CardDescription>Enter your secret passcode</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Passcode input with accessible show/hide toggle */}
            <div className="space-y-2">
              <label htmlFor="passcode" className="text-sm font-medium">
                Passcode
              </label>
              <div className="relative">
                <Input
                  id="passcode"
                  autoFocus
                  type={showPass ? 'text' : 'password'}
                  placeholder="passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  disabled={loading}
                />

                {/* Toggle must be a button (not submit) and keyboard accessible */}
                <button
                  type="button"
                  aria-label={showPass ? 'Hide passcode' : 'Show passcode'}
                  aria-pressed={showPass}
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span className="text-sm">Remember me on this device</span>
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Verifying...' : 'Unlock'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

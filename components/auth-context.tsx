"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface SessionPayload {
  role: 'owner' | 'manager' | 'investor'
  issuedAt: number
  expiresAt: number
}

interface AuthContextType {
  session: SessionPayload | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch server session
    fetch('/api/session')
      .then((r) => r.json())
      .then((json) => {
        setSession(json.session)
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [])

  const signOut = async () => {
    await fetch('/api/logout', { method: 'POST' })
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, loading, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

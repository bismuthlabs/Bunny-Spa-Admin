"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [dateRange, setDateRange] = useState({ from: new Date("2025-01-01"), to: new Date() })
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      redirect('/unlock')
    }
  }, [session, loading])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* <Header dateRange={dateRange} setDateRange={setDateRange} /> */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}

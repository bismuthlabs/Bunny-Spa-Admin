"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [dateRange, setDateRange] = useState({ from: new Date("2025-01-01"), to: new Date() })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header dateRange={dateRange} setDateRange={setDateRange} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

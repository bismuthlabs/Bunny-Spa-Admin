"use client"

import { StatCard } from "@/components/stat-card"
import { SalesTable } from "@/components/sales-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Users, Briefcase, Plus } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({ from: new Date("2025-01-01"), to: new Date() })
  const [overview, setOverview] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/reports/overview')
      .then((r) => r.json())
      .then((p) => {
        if (!mounted) return
        if (!p?.error) setOverview(p)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const revenue = (overview?.revenueByService || []).reduce((s: number, r: any) => s + Number(r.total_revenue || 0), 0)
  const profit = (overview?.revenueByService || []).reduce((s: number, r: any) => s + Number(r.total_profit || 0), 0)
  const outstanding = Number(overview?.outstandingBalance || 0)
  const servicesCompleted = Number(overview?.servicesCompleted || 0)

  const stats = [
    { icon: DollarSign, label: 'Total Revenue (Month)', value: `₵${revenue}`, change: '+12% from last month', trend: 'up' as const },
    { icon: TrendingUp, label: 'Total Profit', value: `₵${profit}`, change: '+8% from last month', trend: 'up' as const },
    { icon: AlertCircle, label: 'Outstanding Balance', value: `₵${outstanding}`, change: '+₵450 due', trend: 'down' as const },
    { icon: CheckCircle, label: 'Services Completed', value: `${servicesCompleted}`, change: '+24 this week', trend: 'up' as const },
  ]

  type Breakdown = { type: string; count: number; percentage: number }
  const serviceBreakdown: Breakdown[] = (overview?.locationData || []).map((l: any) => ({ type: l.location_type === 'In-Shop' ? 'In-Shop Services' : l.location_type, count: Number(l.value || 0), percentage: 0 }))
  // fill percentages conservatively
  const totalBreakdown = serviceBreakdown.reduce((s: number, x: Breakdown) => s + x.count, 0)
  serviceBreakdown.forEach((s: Breakdown) => (s.percentage = totalBreakdown ? Math.round((s.count / totalBreakdown) * 100) : 0))

  return (
    <div className="space-y-6 mt-18 md:mt-0">
      <Header dateRange={dateRange} setDateRange={setDateRange} />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service Location Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceBreakdown.map((service: Breakdown) => (
                <div key={service.type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{service.type}</p>
                    <p className="text-sm text-muted-foreground">{service.count} services</p>
                  </div>
                  <div className="text-right">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${service.percentage}%` }} />
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-1">{service.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/b/sales?action=new" className="block">
              <Button className="w-full" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add New Sale
              </Button>
            </Link>
            <Link href="/b/clients" className="block">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                <Users className="mr-2 h-4 w-4" />
                View Clients
              </Button>
            </Link>
            <Link href="/b/staff" className="block">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                <Briefcase className="mr-2 h-4 w-4" />
                Staff Info
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable />
        </CardContent>
      </Card>
    </div>
  )
}

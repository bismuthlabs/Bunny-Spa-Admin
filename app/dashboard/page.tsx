"use client"

import { StatCard } from "@/components/stat-card"
import { SalesTable } from "@/components/sales-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Plus, Users, Briefcase } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { useState } from "react"

// Mock data
const mockStats = [
  {
    icon: DollarSign,
    label: "Total Revenue (Month)",
    value: "$12,450",
    change: "+12% from last month",
    trend: "up" as const,
  },
  {
    icon: TrendingUp,
    label: "Total Profit",
    value: "$8,320",
    change: "+8% from last month",
    trend: "up" as const,
  },
  {
    icon: AlertCircle,
    label: "Outstanding Balance",
    value: "$2,130",
    change: "+$450 due",
    trend: "down" as const,
  },
  {
    icon: CheckCircle,
    label: "Services Completed",
    value: "156",
    change: "+24 this week",
    trend: "up" as const,
  },
]

const mockServiceBreakdown = [
  { type: "In-Shop Services", count: 98, percentage: 63 },
  { type: "Home Services", count: 58, percentage: 37 },
]



export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({ from: new Date("2025-01-01"), to: new Date() })
  return (
    <div className="space-y-6">
        <Header dateRange={dateRange} setDateRange={setDateRange} />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, idx) => (
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
              {mockServiceBreakdown.map((service) => (
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
            <Link href="/dashboard/sales?action=new" className="block">
              <Button className="w-full" size="sm">
                {/* <Plus className="mr-2 h-4 w-4" /> */}
                Add New Sale
              </Button>
            </Link>
            <Link href="/dashboard/clients" className="block">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                <Users className="mr-2 h-4 w-4" />
                View Clients
              </Button>
            </Link>
            <Link href="/dashboard/staff" className="block">
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

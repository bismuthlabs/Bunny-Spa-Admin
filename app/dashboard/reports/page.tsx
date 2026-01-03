"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download } from "lucide-react"

const revenueByService = [
  { name: "Swedish Massage", revenue: 3200, profit: 2240 },
  { name: "Deep Tissue", revenue: 2800, profit: 1960 },
  { name: "Hot Stone", revenue: 2400, profit: 1680 },
  { name: "Aromatherapy", revenue: 2000, profit: 1400 },
  { name: "Reflexology", revenue: 2050, profit: 1435 },
]

const revenueByStaff = [
  { name: "Maria Garcia", value: 4200 },
  { name: "Lisa Wong", value: 3800 },
  { name: "John Smith", value: 2900 },
  { name: "Robert Lee", value: 1550 },
]

const locationData = [
  { name: "In-Shop", value: 7500 },
  { name: "Home", value: 4950 },
]

const COLORS = ["#6b8e7f", "#9db4a8"]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Analyze your business performance</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#6b8e7f" name="Revenue" />
                <Bar dataKey="profit" fill="#9db4a8" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Location Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByStaff} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#6b8e7f" name="Revenue" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg Service Value</p>
              <p className="text-2xl font-bold text-foreground mt-1">$124</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-2xl font-bold text-foreground mt-1">67%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">78%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Month-over-Month</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+12%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

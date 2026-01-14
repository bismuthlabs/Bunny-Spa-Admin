"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/currency"

export default function StaffPage() {
  const [staff, setStaff] = useState<any[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/staff')
      .then((r) => r.json())
      .then((p) => {
        if (!mounted) return
        if (p?.data) setStaff(p.data)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const list = staff || []
  const totalEarnings = list.reduce((sum, s) => sum + (s.commission || 0), 0)
  const avgRating = list.length ? (list.reduce((sum, s) => sum + (s.rating || 0), 0) / list.length).toFixed(1) : '0.0'

  return (
    <div className="space-y-6 mt-18 md:mt-0">
      <div>
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground mt-1">Monitor staff performance and earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Staff</p>
            <p className="text-3xl font-bold text-foreground mt-2">{list.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active therapists</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Services</p>
            <p className="text-3xl font-bold text-foreground mt-2">{list.reduce((sum, s) => sum + (s.services || 0), 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Commissions</p>
            <p className="text-3xl font-bold text-foreground mt-2">{formatCurrency(totalEarnings)}</p>
            <p className="text-xs text-muted-foreground mt-1">this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="text-3xl font-bold text-foreground mt-2">{avgRating}★</p>
            <p className="text-xs text-muted-foreground mt-1">customer satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Payout Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell className="text-sm">{staff.role}</TableCell>
                    <TableCell className="text-sm">{staff.services || 0}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatCurrency(staff.commission || 0)}</TableCell>
                    <TableCell className="text-sm">{(staff.rating || 0)}★</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          staff.payout_status === "Paid" || staff.payoutStatus === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {staff.payout_status || staff.payoutStatus || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Process Payout</DropdownMenuItem>
                          <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

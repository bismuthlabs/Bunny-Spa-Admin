"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/currency"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/clients')
      .then((r) => r.json())
      .then((p) => {
        if (!mounted) return
        if (p?.data) setClients(p.data)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const list = clients || []

  return (
    <div className="space-y-6 mt-18 md:mt-0">
      <div>
        <h1 className="text-3xl font-bold">Client Management</h1>
        <p className="text-muted-foreground mt-1">View and manage your client base</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-3xl font-bold text-foreground mt-2">{list.length}</p>
            <p className="text-xs text-muted-foreground mt-1">+2 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Returning Clients</p>
            <p className="text-3xl font-bold text-foreground mt-2">{list.filter((c) => c.status !== 'new').length}</p>
            <p className="text-xs text-muted-foreground mt-1">75% retention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg. Spending</p>
            <p className="text-3xl font-bold text-foreground mt-2">{formatCurrency(Math.round((list.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0) / Math.max(1, list.length)))}</p>
            <p className="text-xs text-muted-foreground mt-1">per client</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Client Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Visits</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-sm">{client.phone}</TableCell>
                    <TableCell className="text-sm">{client.visits || 0}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatCurrency(client.total_spent || 0)}</TableCell>
                    <TableCell className="text-sm">{client.last_visit || ''}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          client.status === "VIP"
                            ? "bg-purple-100 text-purple-800"
                            : client.status === "regular"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {client.status}
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Visit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove Client</DropdownMenuItem>
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

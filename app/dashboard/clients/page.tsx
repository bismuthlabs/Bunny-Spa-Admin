"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockClients = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+1-555-0101",
    visits: 12,
    totalSpent: 1440,
    lastVisit: "2025-01-03",
    status: "Regular",
  },
  {
    id: 2,
    name: "Michael Chen",
    phone: "+1-555-0102",
    visits: 8,
    totalSpent: 1200,
    lastVisit: "2025-01-03",
    status: "Regular",
  },
  {
    id: 3,
    name: "Emily Davis",
    phone: "+1-555-0103",
    visits: 3,
    totalSpent: 300,
    lastVisit: "2025-01-02",
    status: "New",
  },
  {
    id: 4,
    name: "James Wilson",
    phone: "+1-555-0104",
    visits: 15,
    totalSpent: 1950,
    lastVisit: "2024-12-28",
    status: "VIP",
  },
]

export default function ClientsPage() {
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
            <p className="text-3xl font-bold text-foreground mt-2">{mockClients.length}</p>
            <p className="text-xs text-muted-foreground mt-1">+2 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Returning Clients</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {mockClients.filter((c) => c.status !== "New").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">75% retention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg. Spending</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              ${Math.round(mockClients.reduce((sum, c) => sum + c.totalSpent, 0) / mockClients.length)}
            </p>
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
                {mockClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-sm">{client.phone}</TableCell>
                    <TableCell className="text-sm">{client.visits}</TableCell>
                    <TableCell className="text-sm font-semibold">${client.totalSpent}</TableCell>
                    <TableCell className="text-sm">{client.lastVisit}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          client.status === "VIP"
                            ? "bg-purple-100 text-purple-800"
                            : client.status === "Regular"
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

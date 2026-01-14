"use client"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { SalesDetailsModal } from "./sales-details-modal"
import { DeleteSaleDialog } from "./delete-sale-dialog"

interface Sale {
  id: string
  date: string
  time: string
  serviceName: string
  locationType: "In-Shop" | "Home" | "Hotel"
  clientName: string
  staffName: string
  price: number
  discount: number
  amountPaid: number
  balance: number
  paymentMethod: string
  profit: number
  status: "Completed" | "Cancelled"
}

export function SalesTable() {
  const [sales, setSales] = useState<Sale[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Sale>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Fetch recent sales from server
  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch("/api/sales")
      .then((res) => res.json())
      .then((payload) => {
        if (!mounted) return
        if (payload?.error) return setError(payload.error)

        const mapped: Sale[] = (payload.data || []).map((raw: any) => ({
          id: raw.id,
          date: raw.service_date || raw.date || "",
          time: (raw.start_time ? `${raw.start_time}` : "") + (raw.end_time ? ` - ${raw.end_time}` : ""),
          serviceName: raw.services?.name || raw.service_name || raw.serviceName || "",
          locationType: raw.location_type || "In-Shop",
          clientName: raw.clients?.name || raw.clientName || "",
          staffName: raw.staff?.name || raw.staffName || "",
          price: Number(raw.price || 0),
          discount: Number(raw.discount || 0),
          amountPaid: Number(raw.amount_paid || 0),
          balance: Number(raw.balance || 0),
          paymentMethod: raw.payment_method || raw.paymentMethod || "",
          profit: Number(raw.profit || 0),
          status: raw.status || "Completed",
        }))

        setSales(mapped)
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const filteredAndSortedSales = useMemo(() => {
    const list = sales || []
    return list
      .filter(
        (sale) =>
          sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.serviceName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]

        if (typeof aVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
        }

        return sortOrder === "asc" ? (Number(aVal) || 0) - (Number(bVal) || 0) : (Number(bVal) || 0) - (Number(aVal) || 0)
      })
  }, [sales, searchTerm, sortBy, sortOrder])

  const handleSort = (column: keyof Sale) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setDetailsOpen(true)
  }

  const handleDeleteClick = (sale: Sale) => {
    setSelectedSale(sale)
    setDeleteOpen(true)
  }

  const handleDeleteSuccess = () => {
    setSales((prev) => prev ? prev.filter((s) => s.id !== selectedSale?.id) : null)
    setSelectedSale(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                Date
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("serviceName")}>
                Service
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("clientName")}>
                Client
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("locationType")}>
                Location
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                Price
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("amountPaid")}>
                Paid
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("balance")}>
                Balance
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                Status
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.date}</TableCell>
                <TableCell className="text-sm">{sale.serviceName}</TableCell>
                <TableCell className="text-sm">{sale.clientName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground">
                    {sale.locationType}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-semibold">{formatCurrency(sale.price)}</TableCell>
                <TableCell className="text-sm">{formatCurrency(sale.amountPaid)}</TableCell>
                <TableCell className={`text-sm font-semibold ${sale.balance > 0 ? "text-red-600" : ""}`}>
                  {formatCurrency(sale.balance)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={sale.status === "Completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {sale.status}
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
                      <DropdownMenuItem onClick={() => handleViewDetails(sale)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem disabled>Edit (coming soon)</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(sale)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SalesDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} sale={selectedSale} />
      <DeleteSaleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        saleId={selectedSale?.id || ""}
        clientName={selectedSale?.clientName || ""}
        serviceName={selectedSale?.serviceName || ""}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  )
}

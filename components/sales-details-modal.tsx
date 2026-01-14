"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"

interface SalesDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: {
    id: string
    date: string
    time: string
    serviceName: string
    locationType: string
    clientName: string
    staffName: string
    price: number
    discount: number
    amountPaid: number
    balance: number
    paymentMethod: string
    profit: number
    status: string
  } | null
}

export function SalesDetailsModal({
  open,
  onOpenChange,
  sale,
}: SalesDetailsModalProps) {
  if (!sale) return null

  const statusColor =
    sale.status === "Completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-full
          max-w-full
          sm:max-w-xl
          md:max-w-2xl
          h-dvh
          sm:h-auto
          p-4
          sm:p-6
          overflow-y-auto
        "
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl">
            Sale Details
          </DialogTitle>
          <DialogDescription>
            Full transaction information
          </DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mt-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Transaction ID</p>
            <p className="font-mono text-xs break-all">{sale.id}</p>
          </div>
          <Badge className={statusColor}>{sale.status}</Badge>
        </div>

        {/* Core Details */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Detail label="Service" value={sale.serviceName} />
          <Detail label="Location" value={sale.locationType} />
          <Detail label="Date" value={sale.date} />
          <Detail label="Time" value={sale.time || "—"} />
        </section>

        {/* People */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Detail label="Client" value={sale.clientName} />
          <Detail label="Staff" value={sale.staffName} />
        </section>

        {/* Financials */}
        <section className="mt-6 rounded-lg bg-muted/40 p-4 space-y-4">
          <h4 className="text-sm font-semibold">Financial Breakdown</h4>

          <div className="space-y-3">
            <FinanceRow label="Price" value={formatCurrency(sale.price)} />
            <FinanceRow
              label="Discount"
              value={formatCurrency(sale.discount)}
              valueClass="text-red-600"
            />
            <FinanceRow
              label="Amount Paid"
              value={formatCurrency(sale.amountPaid)}
            />
            <FinanceRow
              label="Balance Due"
              value={formatCurrency(sale.balance)}
              valueClass={
                sale.balance > 0 ? "text-red-600" : "text-green-600"
              }
            />
          </div>

          <div className="border-t pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold">Net Profit</span>
            <span className="text-lg font-bold">
              {formatCurrency(sale.profit)}
            </span>
          </div>
        </section>

        {/* Payment Method */}
        {sale.paymentMethod && (
          <section className="mt-6">
            <Detail label="Payment Method" value={sale.paymentMethod} />
          </section>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Small Helper Components ---------- */

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  )
}

function FinanceRow({
  label,
  value,
  valueClass = "",
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}

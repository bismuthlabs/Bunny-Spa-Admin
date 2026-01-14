"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"
import { Loader2 } from "lucide-react"

interface ClientProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: {
    id: string
    name: string
    phone?: string
    email?: string
    status: string
    total_spent: number
    visits: number
    last_visit?: string
  } | null
}

interface VisitRecord {
  id: string
  service_date: string
  service_name: string
  price: number
  status: string
}

export function ClientProfileModal({
  open,
  onOpenChange,
  client,
}: ClientProfileModalProps) {
  const [visits, setVisits] = useState<VisitRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !client) return

    setLoading(true)
    setError(null)

    fetch(`/api/clients/${client.id}/visits`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setError(data.error)
        } else {
          setVisits(data?.visits || [])
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [open, client])

  if (!client) return null

  const statusColorMap: Record<string, string> = {
    VIP: "bg-purple-100 text-purple-800",
    regular: "bg-blue-100 text-blue-800",
    new: "bg-green-100 text-green-800",
  }

  const statusColor = statusColorMap[client.status] || "bg-gray-100 text-gray-800"

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
            Client Profile
          </DialogTitle>
          <DialogDescription>
            View client details and visit history
          </DialogDescription>
        </DialogHeader>

        {/* Header with status */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b pb-4 mt-4">
          <div className="space-y-1 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Name</p>
            <p className="text-base sm:text-lg font-semibold wrap-break-word">
              {client.name}
            </p>
          </div>
          <Badge className={statusColor}>{client.status}</Badge>
        </div>

        {/* Contact Details */}
        <section className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold">Contact Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {client.phone && (
              <Detail label="Phone" value={client.phone} />
            )}
            {client.email && (
              <Detail label="Email" value={client.email} />
            )}
          </div>
        </section>

        {/* Statistics */}
        <section className="mt-6 rounded-lg bg-muted/40 p-4 space-y-3">
          <h4 className="text-sm font-semibold">Statistics</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatBox label="Total Visits" value={String(client.visits)} />
            <StatBox
              label="Total Spent"
              value={formatCurrency(client.total_spent)}
              highlight
            />
            <StatBox
              label="Avg per Visit"
              value={formatCurrency(
                client.visits > 0 ? client.total_spent / client.visits : 0
              )}
            />
          </div>
          {client.last_visit && (
            <div className="border-t pt-3 mt-3">
              <p className="text-xs text-muted-foreground">Last Visit</p>
              <p className="text-sm font-medium mt-1">{client.last_visit}</p>
            </div>
          )}
        </section>

        {/* Recent Visits */}
        {/* <section className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold">Recent Visits</h4>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-3 rounded bg-red-50 text-red-800 text-xs">
              Failed to load visits: {error}
            </div>
          ) : visits.length === 0 ? (
            <div className="p-3 rounded bg-muted text-muted-foreground text-sm">
              No visits recorded yet
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-3 rounded border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {visit.service_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {visit.service_date}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <Badge
                        variant="outline"
                        className={
                          visit.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-700"
                        }
                      >
                        {visit.status}
                      </Badge>
                      <p className="text-sm font-semibold whitespace-nowrap">
                        {formatCurrency(visit.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section> */}
      </DialogContent>
    </Dialog>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  )
}

function StatBox({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded p-2 sm:p-3 ${highlight ? "bg-accent/20" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm sm:text-base font-semibold mt-1 ${
          highlight ? "text-accent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

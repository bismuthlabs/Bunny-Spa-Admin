"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/currency"

interface AddSaleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSaleModal({ open, onOpenChange }: AddSaleModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    serviceId: "",
    serviceName: "",
    locationType: "In-Shop",
    clientName: "",
    clientPhone: "",
    staffId: "",
    staffName: "",
    price: "100",
    discount: "0",
    amountPaid: "100",
    paymentMethod: "Cash",
    transportCost: "0",
    otherExpenses: "0",
    staffCommission: "35",
    notes: "",
  })

  const [services, setServices] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    fetch('/api/services')
      .then((r) => r.json())
      .then((p) => {
        if (!mounted) return
        if (p?.data) setServices(p.data)
      })
      .catch(() => {})

    fetch('/api/staff')
      .then((r) => r.json())
      .then((p) => {
        if (!mounted) return
        if (p?.data) setStaffList(p.data)
      })
      .catch(() => {})

    return () => { mounted = false }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-calculate amount paid if it's not already modified
      if (field === "price" || field === "discount") {
        const price = Number.parseFloat(updated.price) || 0
        const discount = Number.parseFloat(updated.discount) || 0
        updated.amountPaid = String(price - discount)
      }

      return updated
    })
  }

  const calculateDuration = () => {
    const start = new Date(`2000-01-01 ${formData.startTime}`)
    const end = new Date(`2000-01-01 ${formData.endTime}`)
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    return minutes > 0 ? minutes : 0
  }

  const duration = calculateDuration()
  const staffCommissionAmount =
    ((Number.parseFloat(formData.price) || 0) * (Number.parseFloat(formData.staffCommission) || 0)) / 100
  const totalExpenses =
    (Number.parseFloat(formData.transportCost) || 0) + (Number.parseFloat(formData.otherExpenses) || 0)
  const profit = (Number.parseFloat(formData.amountPaid) || 0) - staffCommissionAmount - totalExpenses

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Date and Time */}
          <div>
            <Label htmlFor="date">Service Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <div className="mt-1 px-3 py-2 bg-muted rounded-md text-sm">{duration} minutes</div>
          </div>

          {/* Service Details */}
          <div>
            <Label htmlFor="serviceName">Service Name</Label>
            <Select
              value={formData.serviceId}
              onValueChange={(v) => {
                const svc = services.find((s) => s.id === v)
                handleInputChange("serviceId", v)
                if (svc) {
                  handleInputChange("serviceName", svc.name)
                  handleInputChange("price", String(svc.default_price || 0))
                }
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="locationType">Location Type</Label>
            <Select value={formData.locationType} onValueChange={(v) => handleInputChange("locationType", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-Shop">In-Shop</SelectItem>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Details */}
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="clientPhone">Client Phone</Label>
            <Input
              id="clientPhone"
              value={formData.clientPhone}
              onChange={(e) => handleInputChange("clientPhone", e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Staff and Pricing */}
          <div>
            <Label htmlFor="staffName">Staff Name</Label>
            <Select
              value={formData.staffId}
              onValueChange={(v) => {
                const s = staffList.find((x) => x.id === v)
                handleInputChange("staffId", v)
                if (s) handleInputChange("staffName", s.name)
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">Service Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => handleInputChange("discount", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="amountPaid">Amount Paid</Label>
            <Input
              id="amountPaid"
              type="number"
              value={formData.amountPaid}
              onChange={(e) => handleInputChange("amountPaid", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(v) => handleInputChange("paymentMethod", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                <SelectItem value="Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.locationType === "Home" && (
            <div>
              <Label htmlFor="transportCost">Transport Cost</Label>
              <Input
                id="transportCost"
                type="number"
                value={formData.transportCost}
                onChange={(e) => handleInputChange("transportCost", e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="otherExpenses">Other Expenses</Label>
            <Input
              id="otherExpenses"
              type="number"
              value={formData.otherExpenses}
              onChange={(e) => handleInputChange("otherExpenses", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="staffCommission">Staff Commission (%)</Label>
            <Input
              id="staffCommission"
              type="number"
              value={formData.staffCommission}
              onChange={(e) => handleInputChange("staffCommission", e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Auto-calculated fields */}
          <div>
            <Label>Staff Commission Amount</Label>
            <div className="mt-1 px-3 py-2 bg-muted rounded-md text-sm font-semibold">
              {formatCurrency(staffCommissionAmount)}
            </div>
          </div>

          <div>
            <Label>Profit</Label>
            <div
              className={`mt-1 px-3 py-2 bg-muted rounded-md text-sm font-semibold ${profit > 0 ? "text-green-600" : ""}`}
            >
              {formatCurrency(profit)}
            </div>
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              // minimal create logic, server-side validation is authoritative
              try {
                // create client if a name is provided
                let clientId: string | undefined = undefined
                if (formData.clientName && formData.clientName.trim()) {
                  const creRes = await fetch('/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: formData.clientName, phone: formData.clientPhone }),
                  })
                  const creJson = await creRes.json()
                  if (creJson?.id) clientId = creJson.id
                }

                const payload = {
                  service_id: formData.serviceId || undefined,
                  client_id: clientId,
                  staff_id: formData.staffId || undefined,
                  service_date: formData.date,
                  start_time: formData.startTime,
                  end_time: formData.endTime,
                  price: formData.price,
                  discount: formData.discount,
                  amount_paid: formData.amountPaid,
                  payment_method: formData.paymentMethod,
                  location_type: formData.locationType,
                  transport_cost: formData.transportCost,
                  other_expenses: formData.otherExpenses,
                  staff_commission_pct: formData.staffCommission,
                  notes: formData.notes,
                }

                await fetch('/api/sales', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                })

                onOpenChange(false)
                // TODO: consider optimistic UI / refresh sales table via context or event
              } catch (err) {
                console.error(err)
                onOpenChange(false)
              }
            }}
            className="bg-primary"
          >
            Save Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

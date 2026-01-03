"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AddSaleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSaleModal({ open, onOpenChange }: AddSaleModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    serviceName: "Swedish Massage",
    locationType: "In-Shop",
    clientName: "",
    clientPhone: "",
    staffName: "Maria Garcia",
    price: "100",
    discount: "0",
    amountPaid: "100",
    paymentMethod: "Cash",
    transportCost: "0",
    otherExpenses: "0",
    staffCommission: "35",
    notes: "",
  })

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
            <Select value={formData.serviceName} onValueChange={(v) => handleInputChange("serviceName", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Swedish Massage">Swedish Massage</SelectItem>
                <SelectItem value="Deep Tissue Massage">Deep Tissue Massage</SelectItem>
                <SelectItem value="Hot Stone Massage">Hot Stone Massage</SelectItem>
                <SelectItem value="Aromatherapy">Aromatherapy</SelectItem>
                <SelectItem value="Reflexology">Reflexology</SelectItem>
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
            <Select value={formData.staffName} onValueChange={(v) => handleInputChange("staffName", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maria Garcia">Maria Garcia</SelectItem>
                <SelectItem value="John Smith">John Smith</SelectItem>
                <SelectItem value="Lisa Wong">Lisa Wong</SelectItem>
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
              ${staffCommissionAmount.toFixed(2)}
            </div>
          </div>

          <div>
            <Label>Profit</Label>
            <div
              className={`mt-1 px-3 py-2 bg-muted rounded-md text-sm font-semibold ${profit > 0 ? "text-green-600" : ""}`}
            >
              ${profit.toFixed(2)}
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
          <Button onClick={() => onOpenChange(false)} className="bg-primary">
            Save Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

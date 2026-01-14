"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DeleteSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  saleId: string
  clientName: string
  serviceName: string
  onDeleteSuccess?: () => void
}

export function DeleteSaleDialog({
  open,
  onOpenChange,
  saleId,
  clientName,
  serviceName,
  onDeleteSuccess,
}: DeleteSaleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/sales?id=${saleId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete sale")
      }

      onOpenChange(false)
      onDeleteSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Sale</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this sale? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded bg-muted p-3 text-sm space-y-1">
          <p>
            <span className="font-semibold">Client:</span> {clientName}
          </p>
          <p>
            <span className="font-semibold">Service:</span> {serviceName}
          </p>
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

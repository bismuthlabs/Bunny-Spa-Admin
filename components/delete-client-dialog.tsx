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

interface DeleteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  visits: number
  totalSpent: number
  onDeleteSuccess?: () => void
}

export function DeleteClientDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  visits,
  totalSpent,
  onDeleteSuccess,
}: DeleteClientDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/clients?id=${clientId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to remove client")
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
      <DialogContent className="w-full max-w-full sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg">Remove Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this client? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded bg-muted p-4 text-sm space-y-2">
          <p>
            <span className="font-semibold">Client:</span> {clientName}
          </p>
          <p>
            <span className="font-semibold">Total Visits:</span> {visits}
          </p>
          <p>
            <span className="font-semibold">Total Spent:</span> ₵{totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs">
          <p className="font-semibold mb-1">⚠️ Warning</p>
          <p>All associated visit records will be preserved for reporting purposes, but this client will be removed from active records.</p>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Removing..." : "Remove Client"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

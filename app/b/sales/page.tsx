"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesTable } from "@/components/sales-table"
import { AddSaleModal } from "@/components/add-sale-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

export default function SalesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-6 mt-18 md:mt-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground mt-1">Record and track all service sales</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="md:w-auto">
          {/* <Plus className="mr-2 h-4 w-4" /> */}
          Add New Sale
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTable />
        </CardContent>
      </Card>

      <AddSaleModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}

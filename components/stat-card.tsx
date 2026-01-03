import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
}

export function StatCard({ icon: Icon, label, value, change, trend }: StatCardProps) {
  return (
    <Card className="bg-card hover:shadow-sm transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
            {change && (
              <p
                className={`text-xs mt-2 ${
                  trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {change}
              </p>
            )}
          </div>
          <div className="bg-accent/10 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

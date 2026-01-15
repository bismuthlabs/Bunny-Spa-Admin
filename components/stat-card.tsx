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
    <Card className="relative md:static bg-card hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start md:items-center justify-between gap-3">
          {/* Text */}
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium line-clamp-">
              {label}
            </p>

            <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">
              {value}
            </p>

            {change && (
              <p
                className={`text-[11px] w-full sm:text-xs mt-1 ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {change}
              </p>
            )}
          </div>

          {/* Icon */}
          <div className="absolute md:static right-2 top-2 shrink-0 bg-accent/10 p-2 sm:p-3 rounded-lg">
            <Icon className="h-3 w-3 sm:h-6 sm:w-6 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

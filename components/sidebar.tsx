"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ShoppingCart, Users, Briefcase, BarChart3, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-context"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/b" },
  { label: "Sales", icon: ShoppingCart, href: "/b/sales" },
  { label: "Clients", icon: Users, href: "/b/clients" },
  { label: "Staff", icon: Briefcase, href: "/b/staff" },
  { label: "Reports", icon: BarChart3, href: "/b/reports" },
]


export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  
  const handleNavClick = () => setIsOpen(false)
  
  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="default"
        size="icon"
        className="absolute left-4 top-4 md:hidden z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 h-screen w-64 border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 flex flex-col",
          !isOpen && "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="border-b border-sidebar-border p-6">
          <div className="text-2xl font-bold text-sidebar-primary">Bunny Spa</div>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Business Manager</p>
        </div>

      <nav className="flex-1 space-y-2 p-4">
  {navItems.map((item) => {
    const isActive = pathname === item.href

    return (
      <Link key={item.href} href={item.href} onClick={handleNavClick}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start",
            isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    )
  })}
</nav>


        <div className="border-t border-sidebar-border p-4">
          <button
            className="w-full text-xs bg-transparent text-left"
            onClick={async () => {
              try {
                await signOut()
                router.push('/unlock')
              } catch {}
            }}
          >
            <span className="w-full text-xs bg-transparent">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

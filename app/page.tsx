"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">Welcome to Bunny Spa Admin</h1>
        <p className="text-lg text-muted-foreground">
          Manage your salon operations, track sales, and grow your business
        </p>
        <Link href="/auth/login">
          <Button size="lg" className="mt-6">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}

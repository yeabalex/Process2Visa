"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

import { Sidebar } from "@/components/student-sidebar"
import { Search, Plane, Bell, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

interface CollegeResult {
  name: string
  id: number
  slug: string
  address: {
    street1: string
    street2: string | null
    city: string
    state: string
    zipCode: string
  }
}

interface ApiResponse {
  results: CollegeResult[]
  total: number
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)



  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="lg:pl-64">
        <header className="border-b border-border bg-card/50 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Travel & Visa Services</h1>
                  <p className="text-sm text-muted-foreground">Explore visa options and travel services</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden bg-transparent"
              onClick={() => setSidebarOpen(true)}
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

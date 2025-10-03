"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { User, FileText, Bell, HelpCircle, Settings, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navigation = [
  { name: "Travel", icon: User, href: "#", current: true },
  { name: "Support", icon: HelpCircle, href: "/support", current: false },
]

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const router = useRouter()

  const handleNavigation = (href: string) => {
    if (href !== "#") {
      router.push(href)
      onOpenChange(false) // Close mobile sidebar after navigation
    }
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Dashboard</h2>
        <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.current
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Student Name</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">student@email.com</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

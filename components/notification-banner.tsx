"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Plane, Clock } from "lucide-react"

export function NotificationBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="mb-6">
      <Alert className="border-accent/20 bg-accent/10">
        <Plane className="h-4 w-4 text-accent" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              Don't forget your visa interview next week ✈️
              <span className="ml-2 text-muted-foreground">
                <Clock className="inline h-3 w-3 mr-1" />
                March 20, 2024 at 2:00 PM
              </span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-accent/20"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Error boundary component for better error handling

"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
            <CardDescription>An error occurred while loading this component.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {this.state.error && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">{this.state.error.message}</div>
              )}
              <Button onClick={() => this.setState({ hasError: false, error: undefined })} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export function ErrorCard({
  title = "Error",
  message = "Something went wrong",
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

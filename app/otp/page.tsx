"use client"

import React, { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

function OTPSuspenseWrapper() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("chatId") || ""

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-verify when OTP is complete (6 digits)
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP()
    }
  }, [otp])

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, chatId }), // ✅ Include chatId here
      })

      if (response.ok) {
        router.push("/")
      } else {
        const data = await response.json()
        setError(data.error || "Invalid verification code")
        setOtp("") // Clear OTP on error
      }
    } catch (error) {
      setError("Verification failed. Please try again.")
      setOtp("") // Clear OTP on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Enter Verification Code</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to your Telegram. Enter it below to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              className="text-center text-2xl font-mono tracking-widest"
              maxLength={6}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Verifying code...
            </div>
          )}

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <OTPSuspenseWrapper />
    </Suspense>
  )
}

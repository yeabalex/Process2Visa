"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("+251 ")
  
  const handleTelegramLogin = async () => {
    if (!phoneNumber.trim() || phoneNumber === "+251 ") {
      alert("Please enter your phone number")
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      })
      
      const data = await response.json()
      
      if (data.success && data.redirectUrl) {
        // Redirect on the frontend
        router.push(data.redirectUrl)
      } else {
        // Handle error
        alert(data.message || "Failed to send verification code")
      }
      
    } catch (error) {
      console.error("Error sending code:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Process2Visa</CardTitle>
          <CardDescription>Your trusted travel consultancy partner for visa applications and travel planning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+251 9 12 34 56 78"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleTelegramLogin}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending code...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.655-.566 3.118-.566 3.118-.107.317-.314.394-.6.394-.377 0-.754-.107-1.131-.317 0 0-2.234-1.471-3.118-2.127-.377-.28-.754-.84-.377-1.274.754-.866 1.697-1.697 2.828-2.828.566-.566.377-.896-.188-.33-1.274 1.131-3.695 2.939-3.695 2.939s-.377.188-.896.188c-.566 0-1.131-.188-1.131-.188s-1.274-.754-.377-1.508c.896-.754 8.16-3.695 8.16-3.695s.754-.28 1.131-.188c.188.047.377.141.377.424z" />
                </svg>
                Continue with Telegram
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
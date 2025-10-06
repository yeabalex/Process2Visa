"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function RegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phoneNumber: "",
    nationality: "",
    preferredCountry: "Ethiopia",
    educationLevel: "",
    telegramChatId: searchParams.get("chat_id") || ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.age || !formData.phoneNumber || !formData.nationality || !formData.preferredCountry || !formData.educationLevel) {
      alert("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Registration successful, redirect to main app
        router.push("/")
      } else {
        alert(data.message || "Registration failed")
      }

    } catch (error) {
      console.error("Error registering:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Registration</CardTitle>
          <CardDescription>Please provide your information to continue using Process2Visa</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                min="1"
                max="120"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+251 9 12 34 56 78"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Input
                id="nationality"
                type="text"
                placeholder="Enter your nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredCountry">Preferred Country *</Label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-gray-700">🇪🇹 Ethiopia</span>
                <p className="text-xs text-gray-500 mt-1">Currently only Ethiopia is available</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Education Level *</Label>
              <Select value={formData.educationLevel} onValueChange={(value) => handleInputChange("educationLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </div>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

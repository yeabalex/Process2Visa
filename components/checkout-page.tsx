"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Building2, CheckCircle, AlertCircle } from "lucide-react"
import { getServiceFromCache } from "@/lib/serviceCache"
import { useAuth } from "@/context/AuthContext"
import { Service } from "./BrowseServicesEmptyState"


export interface PurchaseData {
  chat_id: string;               // user/chat identifier
  service: string;               // Service _id
  amount: number;                // purchase amount
  method: "cbe" | "tele-birr";  // payment method
  currency?: string;             // default "ETB"
  date?: Date;                   // default Date.now
  status?: "pending" | "completed" | "failed"; // default "pending"
  txn_id: string;                // transaction id
  createdAt?: Date;              // auto timestamps
  updatedAt?: Date;              // auto timestamps
}


type PaymentMethod = "tele-birr" | "cbe"

const ACCOUNT_NUMBERS = {
  "tele-birr": "1234567890",
  "cbe": "1000123456789",
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { chatId } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tele-birr")
  const [transactionId, setTransactionId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const serviceId = searchParams.get("serviceid")

  useEffect(() => {
    if (!serviceId) {
      setError("Service ID is required")
      setLoading(false)
      return
    }

    const loadService = async () => {
      try {
        const serviceData = sessionStorage.getItem('servicesCache') ? JSON.parse(sessionStorage.getItem('servicesCache') || '[]').find((s: Service) => s._id === serviceId) : getServiceFromCache(serviceId)
        if (!serviceData) {
          setError("Service not found")
        } else {
          setService(serviceData)
        }
      } catch (err) {
        setError("Failed to load service details")
        console.error("Service loading error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!service || !chatId || !transactionId.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const purchaseData: PurchaseData = {
        service: service._id,
        amount: service.price,
        method: paymentMethod,
        currency: service.currency,
        txn_id: transactionId.trim(),
        status: "pending",
        chat_id: chatId,
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Purchase failed")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.back()} variant="outline" className="w-full mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your payment has been submitted successfully. We'll process it shortly.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-balance">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your purchase</p>
        </div>

        {service && (
          <div className="space-y-6">
            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{service.displayName}</h3>
                  <p className="text-muted-foreground mt-1">{service.description}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {service.price} {service.currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Choose your payment method and complete the transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                      className="grid grid-cols-1 gap-4"
                    >
                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="tele-birr" id="telebirr" />
                        <Label htmlFor="telebirr" className="flex items-center cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium">Telebirr</div>
                            <div className="text-sm text-muted-foreground">Mobile payment</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="cbe" id="cbe" />
                        <Label htmlFor="cbe" className="flex items-center cursor-pointer flex-1">
                          <Building2 className="h-5 w-5 mr-3 text-primary" />
                          <div>
                            <div className="font-medium">Commercial Bank of Ethiopia (CBE)</div>
                            <div className="text-sm text-muted-foreground">Bank transfer</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Account Number Display */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {paymentMethod === "tele-birr" ? "Telebirr Number" : "CBE Account Number"}
                    </Label>
                    <div className="text-lg font-mono font-bold mt-1">{ACCOUNT_NUMBERS[paymentMethod]}</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please send {service.price} {service.currency} to this{" "}
                      {paymentMethod === "tele-birr" ? "number" : "account"} and enter the transaction ID below.
                    </p>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="space-y-2">
                    <Label htmlFor="txn-id" className="text-base font-medium">
                      Transaction ID *
                    </Label>
                    <Input
                      id="txn-id"
                      type="text"
                      placeholder="Enter transaction ID from your payment"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                      className="text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the transaction ID you received after making the payment
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full text-base py-6"
                    disabled={submitting || !transactionId.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Payment"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

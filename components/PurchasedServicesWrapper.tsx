"use client"

import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import UserPurchasedServices from "./UserPurchasedServices"
import {BrowseServicesEmptyState} from "./BrowseServicesEmptyState"

interface Service {
  _id: string
  name: string
  displayName?: string
  description?: string
  price: number
  currency: string
}

export default function PurchasedServicesWrapper() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { chatId } = useAuth()

  useEffect(() => {
    const fetchPurchasedServices = async () => {
      try {
        const res = await fetch(`/api/purchases?chat_id=${chatId}`)
        if (!res.ok) throw new Error("Failed to fetch services")
        const data = await res.json()
        setServices(data.services || [])
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchPurchasedServices()
  }, [chatId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShoppingBag className="h-10 w-10 animate-pulse mb-3" />
        <p className="text-lg font-medium">Loading your services...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-500">
        <p className="mb-2 text-lg font-medium">Oops! Something went wrong</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (services.length === 0) {
    return <BrowseServicesEmptyState />
  }

  return <UserPurchasedServices services={services} />
}

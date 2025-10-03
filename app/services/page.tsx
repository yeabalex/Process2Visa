"use client"

import { useState, useEffect } from 'react'
import { ServiceCard } from '@/components/ui/service-card'
import { ServiceDisplay } from '@/components/ui/service-display'
import { api, type Service } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cards' | 'display'>('cards')
  const { toast } = useToast()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await api.getServices()
      if (response.success && response.data) {
        setServices(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    // Handle service selection - navigate to service details or add to cart
    console.log('Selected service:', service)
    toast({
      title: "Service Selected",
      description: `Selected ${service.displayName}`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading services...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the perfect consultation service for your educational journey
          </p>

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-4">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              onClick={() => setViewMode('cards')}
            >
              Card View (with Background Images)
            </Button>
            <Button
              variant={viewMode === 'display' ? 'default' : 'outline'}
              onClick={() => setViewMode('display')}
            >
              Display View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            viewMode === 'cards' ? (
              <ServiceCard
                key={service._id}
                service={service}
                onSelect={handleServiceSelect}
              />
            ) : (
              <ServiceDisplay
                key={service._id}
                service={service}
                onSelect={handleServiceSelect}
                showDescription={true}
              />
            )
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { ServiceDisplay } from '@/components/ui/service-display'
import { ServiceCard } from '@/components/ui/service-card'
import { api, type Service } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ServicesShowcase() {
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
    toast({
      title: "Service Selected",
      description: `You selected ${service.displayName}`,
    })
    // Here you could navigate to service details or checkout
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading services...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
              <p className="text-gray-600 mt-1">
                Choose the perfect consultation service with beautiful background images
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                onClick={() => setViewMode('cards')}
              >
                Card View
              </Button>
              <Button
                variant={viewMode === 'display' ? 'default' : 'outline'}
                onClick={() => setViewMode('display')}
              >
                Display View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {services.length > 0 ? (
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
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No services available at the moment.</p>
              <p className="text-gray-400 text-sm mt-2">
                Services will appear here once they have background images configured.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>How to Add Background Images</CardTitle>
              <CardDescription>
                Instructions for administrators to add background images to services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">1. Admin Panel</h4>
                <p className="text-sm text-muted-foreground">
                  Go to the admin dashboard and navigate to Services Management
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">2. Add/Edit Service</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Add Service" or edit an existing service and fill in the "Background Image URL" field
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">3. Image Requirements</h4>
                <p className="text-sm text-muted-foreground">
                  Use high-quality images (recommended: 1200x800px or higher) that work well as backgrounds
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">4. User Experience</h4>
                <p className="text-sm text-muted-foreground">
                  Once configured, services will display with beautiful background images for users
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

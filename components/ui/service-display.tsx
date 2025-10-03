import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Service } from '@/lib/api'

interface ServiceDisplayProps {
  service: Service
  onSelect?: (service: Service) => void
  showDescription?: boolean
}

export function ServiceDisplay({ service, onSelect, showDescription = true }: ServiceDisplayProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(service)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Background Image */}
      <div
        className="relative h-48 bg-cover bg-center"
        style={{
          backgroundImage: service.image
            ? `url(${service.image})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Service Info Overlay */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-900">
            {service.displayName}
          </Badge>
        </div>

        {/* Price Overlay */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/90 text-gray-900 font-semibold">
            {service.price.toLocaleString()} {service.currency}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {showDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        {onSelect && (
          <Button onClick={handleSelect} className="w-full">
            Select Service
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

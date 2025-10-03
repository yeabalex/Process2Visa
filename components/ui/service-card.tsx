import React from 'react'
import { Service } from '@/lib/api'

interface ServiceCardProps {
  service: Service
  onSelect?: (service: Service) => void
  className?: string
}

export function ServiceCard({ service, onSelect, className = '' }: ServiceCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(service)
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg cursor-pointer transition-all hover:scale-105 ${className}`}
      onClick={handleClick}
      style={{
        backgroundImage: service.image ? `url(${service.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '200px'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
        <div>
          <h3 className="text-xl font-bold mb-2">{service.displayName}</h3>
          <p className="text-sm opacity-90 mb-4">{service.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            {service.price.toLocaleString()} {service.currency}
          </span>
          {onSelect && (
            <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-md text-sm font-medium hover:bg-white/30 transition-colors">
              Select
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

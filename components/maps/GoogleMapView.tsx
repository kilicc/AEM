'use client'

import { useEffect, useRef } from 'react'

interface GoogleMapViewProps {
  lat: number
  lng: number
  address?: string
  zoom?: number
  markerTitle?: string
}

export function GoogleMapView({ lat, lng, address, zoom = 15, markerTitle }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Google Maps API key'i environment variable'dan al
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn('Google Maps API key bulunamadı')
      return
    }

    // Google Maps script'i yükle
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.google && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom,
        })

        // Marker ekle
        new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: markerTitle || address || 'Konum',
        })

        // Info window ekle
        if (address) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${markerTitle || 'Konum'}</strong><br>${address}</div>`,
          })

          map.addListener('click', () => {
            infoWindow.open(map)
          })
        }
      }
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [lat, lng, address, zoom, markerTitle])

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-lg border border-gray-300"
      style={{ minHeight: '256px' }}
    />
  )
}

// TypeScript için Google Maps tip tanımları
declare global {
  interface Window {
    google: any
  }
}


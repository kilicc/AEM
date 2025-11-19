// Geolocation utilities

export interface Location {
  lat: number
  lng: number
  address?: string
}

export async function getCurrentLocation(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Try to get address from reverse geocoding
        let address: string | undefined
        try {
          // Using a free reverse geocoding service (you can replace with your preferred service)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                'User-Agent': 'AEM-System/1.0',
              },
            }
          )
          const data = await response.json()
          address = data.display_name
        } catch (error) {
          console.warn('Reverse geocoding failed:', error)
        }

        resolve({ lat, lng, address })
      },
      (error) => {
        console.error('Geolocation error:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

export function formatLocation(location: Location): string {
  if (location.address) {
    return location.address
  }
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}


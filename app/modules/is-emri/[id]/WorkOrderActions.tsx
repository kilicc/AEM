'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateWorkOrderStatus } from '@/modules/is-emri/actions'
import { getCurrentLocation } from '@/lib/location/geolocation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WorkOrderActionsProps {
  workOrderId: string
  currentStatus: string
}

export default function WorkOrderActions({ workOrderId, currentStatus }: WorkOrderActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStatusChange(newStatus: 'in-progress' | 'completed') {
    setLoading(true)
    setError('')

    try {
      let location = undefined

      if (newStatus === 'in-progress') {
        // Konum al
        const loc = await getCurrentLocation()
        if (loc) {
          location = {
            lat: loc.lat,
            lng: loc.lng,
            address: loc.address,
          }
        }
      }

      const result = await updateWorkOrderStatus(workOrderId, newStatus, location)

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşlemler</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {currentStatus === 'waiting' && (
            <Button
              onClick={() => handleStatusChange('in-progress')}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'İşleme Alınıyor...' : 'İşleme Al'}
            </Button>
          )}

          {currentStatus === 'in-progress' && (
            <Button
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? 'Tamamlanıyor...' : 'Tamamla ve Kapat'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


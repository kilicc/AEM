'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

interface Device {
  id: string
  device_type: string
  brand?: string
  model?: string
  serial_number?: string
  notes?: string
  created_at: string
}

interface CustomerDevicesHistoryProps {
  devices: Device[]
  customerId: string
}

export default function CustomerDevicesHistory({ devices, customerId }: CustomerDevicesHistoryProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Cihaz Geçmişi</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'İptal' : 'Yeni Cihaz Ekle'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">Cihaz ekleme formu buraya gelecek</p>
          </div>
        )}

        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{device.device_type}</h4>
                  {device.brand && (
                    <p className="text-sm text-gray-600">
                      Marka: {device.brand} {device.model && `- ${device.model}`}
                    </p>
                  )}
                  {device.serial_number && (
                    <p className="text-sm text-gray-600">Seri No: {device.serial_number}</p>
                  )}
                  {device.notes && (
                    <p className="text-sm text-gray-500 mt-2">{device.notes}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Kayıt: {formatDate(device.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <p className="text-center text-gray-500 py-4">Henüz cihaz kaydı bulunmuyor</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


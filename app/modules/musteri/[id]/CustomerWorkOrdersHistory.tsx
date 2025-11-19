'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface WorkOrder {
  id: string
  status: string
  services?: { name: string }
  created_at: string
  completed_at?: string
}

interface CustomerWorkOrdersHistoryProps {
  workOrders: WorkOrder[]
}

export default function CustomerWorkOrdersHistory({ workOrders }: CustomerWorkOrdersHistoryProps) {
  const statusColors: Record<string, string> = {
    waiting: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<string, string> = {
    waiting: 'Beklemede',
    'in-progress': 'İşlemde',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İş Emri Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workOrders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link href={`/modules/is-emri/${order.id}`}>
                    <h4 className="font-semibold text-blue-600 hover:underline">
                      {order.services?.name || 'Hizmet'}
                    </h4>
                  </Link>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Oluşturulma: {formatDateTime(order.created_at)}</p>
                    {order.completed_at && (
                      <p>Tamamlanma: {formatDateTime(order.completed_at)}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                  <Link href={`/modules/is-emri/${order.id}`}>
                    <Button variant="outline" size="sm">
                      Detay
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {workOrders.length === 0 && (
            <p className="text-center text-gray-500 py-4">Henüz iş emri bulunmuyor</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


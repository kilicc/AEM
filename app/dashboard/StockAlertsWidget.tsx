'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Package } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StockAlertsWidget() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch('/api/stock-alerts')
        if (response.ok) {
          const data = await response.json()
          setAlerts(data.alerts || [])
        }
      } catch (error) {
        console.error('Stok uyarıları yüklenemedi:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Stok Uyarıları
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  const activeAlerts = alerts.filter((a: any) => !a.resolved)

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Stok Uyarıları
            {activeAlerts.length > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-semibold">
                {activeAlerts.length}
              </span>
            )}
          </CardTitle>
          <Link href="/modules/depo">
            <Button variant="outline" size="sm" className="text-xs">
              Depolara Git
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {activeAlerts.length === 0 ? (
          <div className="text-center py-4">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Stok uyarısı yok</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeAlerts.slice(0, 5).map((alert: any) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                      {alert.product_name}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      {alert.depot_name} - Kalan: {alert.current_quantity} {alert.unit}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Eşik: {alert.threshold} {alert.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {activeAlerts.length > 5 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                +{activeAlerts.length - 5} uyarı daha
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


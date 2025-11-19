import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getWorkOrders } from '@/modules/is-emri/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function WorkOrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getWorkOrders(user.role === 'admin' ? undefined : user.id)
  const workOrders = result.data || []

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
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.role === 'admin' ? 'İş Emirleri' : 'İş Emirlerim'}
          </h1>
          {user.role === 'admin' && (
            <Link href="/modules/is-emri/yeni">
              <Button>Yeni İş Emri</Button>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {workOrders.map((order: any) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/modules/is-emri/${order.id}`}>
                            <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                              {order.customers?.name || 'Müşteri'}
                            </h3>
                          </Link>
                          {order.priority && order.priority !== 'normal' && (
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${
                                order.priority === 'urgent'
                                  ? 'bg-red-100 text-red-800'
                                  : order.priority === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {order.priority === 'urgent' ? 'Acil' : order.priority === 'high' ? 'Yüksek' : 'Düşük'}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">
                          {order.services?.name || 'Hizmet'}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Atanan: {order.users?.name || 'Bilinmiyor'}</p>
                          <p>Oluşturulma: {formatDateTime(order.created_at)}</p>
                          {order.location_address && (
                            <p>Konum: {order.location_address}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
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
              </CardContent>
            </Card>
          ))}

          {workOrders.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <p>Henüz iş emri bulunmuyor</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}


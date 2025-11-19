import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getWorkOrders } from '@/modules/is-emri/actions'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getWorkOrders(user.id)
  const workOrders = result.data || []

  // Tarihe göre grupla
  const ordersByDate: Record<string, any[]> = {}
  workOrders.forEach((order: any) => {
    const date = formatDate(order.created_at)
    if (!ordersByDate[date]) {
      ordersByDate[date] = []
    }
    ordersByDate[date].push(order)
  })

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Takvim</h1>

        <div className="space-y-6">
          {Object.entries(ordersByDate).map(([date, orders]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{date}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/modules/is-emri/${order.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{order.customers?.name}</p>
                          <p className="text-sm text-gray-500">
                            {order.services?.name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status === 'completed'
                            ? 'Tamamlandı'
                            : order.status === 'in-progress'
                            ? 'İşlemde'
                            : 'Beklemede'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.keys(ordersByDate).length === 0 && (
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


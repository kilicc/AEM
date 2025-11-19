import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getWorkOrders } from '@/modules/is-emri/actions'
import { getDepots } from '@/modules/depo/actions'
import { getCustomers } from '@/modules/musteri/actions'
import { getInvoices } from '@/modules/fatura/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Admin için tüm veriler, kullanıcı için sadece kendi iş emirleri
  const workOrdersResult = await getWorkOrders(user.role === 'admin' ? undefined : user.id)
  const workOrders = workOrdersResult.data || []

  let depots: any[] = []
  let customers: any[] = []
  let invoices: any[] = []

  if (user.role === 'admin') {
    const depotsResult = await getDepots()
    depots = depotsResult.data || []

    const customersResult = await getCustomers()
    customers = customersResult.data || []

    const invoicesResult = await getInvoices()
    invoices = invoicesResult.data || []
  }

  const waitingOrders = workOrders.filter((wo: any) => wo.status === 'waiting')
  const inProgressOrders = workOrders.filter((wo: any) => wo.status === 'in-progress')
  const completedOrders = workOrders.filter((wo: any) => wo.status === 'completed')

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Hoş Geldiniz, {user.name}
        </h1>

        {user.role === 'admin' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Toplam Depo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{depots.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Toplam Müşteri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{customers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Toplam İş Emri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{workOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Toplam Fatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{invoices.length}</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Bekleyen İşler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{waitingOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Devam Eden İşler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{inProgressOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Tamamlanan İşler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedOrders.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Son İş Emirleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workOrders.slice(0, 5).map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/modules/is-emri/${order.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{order.customers?.name || 'Müşteri'}</p>
                        <p className="text-sm text-gray-500">
                          {order.services?.name || 'Hizmet'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(order.created_at)}
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
                {workOrders.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Henüz iş emri yok</p>
                )}
              </div>
            </CardContent>
          </Card>

          {user.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/modules/is-emri/yeni">
                    <Button className="w-full" variant="default">
                      Yeni İş Emri Oluştur
                    </Button>
                  </Link>
                  <Link href="/modules/musteri/yeni">
                    <Button className="w-full" variant="outline">
                      Yeni Müşteri Ekle
                    </Button>
                  </Link>
                  <Link href="/modules/depo/yeni">
                    <Button className="w-full" variant="outline">
                      Yeni Depo Oluştur
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}


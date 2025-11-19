import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect, notFound } from 'next/navigation'
import { getCustomer } from '@/modules/musteri/actions'
import { getWorkOrders } from '@/modules/is-emri/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import CustomerDevicesHistory from './CustomerDevicesHistory'
import CustomerWorkOrdersHistory from './CustomerWorkOrdersHistory'

export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getCustomer(params.id)

  if (result.error || !result.data) {
    notFound()
  }

  const customer = result.data

  // Bu müşteriye ait iş emirlerini getir
  const workOrdersResult = await getWorkOrders()
  const allWorkOrders = workOrdersResult.data || []
  const customerWorkOrders = allWorkOrders.filter((wo: any) => wo.customer_id === params.id)

  return (
    <Layout>
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {customer.name}
          </h1>
          <div className="text-sm text-gray-600">
            Kayıt Tarihi: {formatDate(customer.created_at)}
          </div>
        </div>

        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
                {customer.email && (
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
                {customer.city && (
                  <div>
                    <p className="text-sm text-gray-500">İl</p>
                    <p className="font-medium">{customer.city}</p>
                  </div>
                )}
                {customer.district && (
                  <div>
                    <p className="text-sm text-gray-500">İlçe</p>
                    <p className="font-medium">{customer.district}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cihaz Geçmişi */}
          <CustomerDevicesHistory devices={customer.customer_devices || []} customerId={params.id} />

          {/* İş Emri Geçmişi */}
          <CustomerWorkOrdersHistory workOrders={customerWorkOrders} />
        </div>
      </div>
    </Layout>
  )
}


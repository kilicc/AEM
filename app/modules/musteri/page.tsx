import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getCustomers } from '@/modules/musteri/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getCustomers()
  const customers = result.data || []

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
          {user.role === 'admin' && (
            <Link href="/modules/musteri/yeni">
              <Button>Yeni Müşteri</Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer: any) => (
            <Card key={customer.id}>
              <CardHeader>
                <CardTitle>{customer.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Telefon:</span> {customer.phone}
                  </p>
                  {customer.email && (
                    <p className="text-gray-600">
                      <span className="font-medium">E-posta:</span> {customer.email}
                    </p>
                  )}
                  <p className="text-gray-600">
                    <span className="font-medium">Adres:</span> {customer.address}
                  </p>
                  <p className="text-xs text-gray-400">
                    Kayıt: {formatDate(customer.created_at)}
                  </p>
                </div>
                <Link href={`/modules/musteri/${customer.id}`} className="mt-4 block">
                  <Button variant="outline" className="w-full">
                    Detay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

          {customers.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-gray-500">
                <p>Henüz müşteri bulunmuyor</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}


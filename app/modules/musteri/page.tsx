import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getCustomers } from '@/modules/musteri/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { DataTable } from '@/components/ui/DataTable'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getCustomers()
  const customers = result.data || []

  const columns = [
    {
      key: 'name',
      label: 'Ad Soyad',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Telefon',
      sortable: true,
    },
    {
      key: 'email',
      label: 'E-posta',
      sortable: true,
      render: (item: any) => item.email || '-',
    },
    {
      key: 'address',
      label: 'Adres',
      render: (item: any) => (
        <span className="max-w-xs truncate block" title={item.address}>
          {item.address}
        </span>
      ),
    },
    {
      key: 'city',
      label: 'Şehir',
      sortable: true,
      render: (item: any) => item.city || '-',
    },
    {
      key: 'created_at',
      label: 'Kayıt Tarihi',
      sortable: true,
      render: (item: any) => formatDate(item.created_at),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (item: any) => (
        <Link href={`/modules/musteri/${item.id}`}>
          <Button variant="outline" size="sm">
            Detay
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Müşteriler</h1>
            {user.role === 'admin' && (
              <Link href="/modules/musteri/yeni">
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Müşteri
                </Button>
              </Link>
            )}
          </div>

          <DataTable
            title="Müşteri Listesi"
            data={customers}
            columns={columns}
            searchable
            searchKeys={['name', 'phone', 'email', 'address', 'city']}
            filterable
            filters={[
              {
                key: 'city',
                label: 'Şehir',
                options: [
                  ...new Set(customers.map((c: any) => c.city).filter(Boolean)),
                ].map((city) => ({ value: city, label: city })),
              },
            ]}
            emptyMessage="Henüz müşteri bulunmuyor"
          />
        </div>
      </div>
    </Layout>
  )
}

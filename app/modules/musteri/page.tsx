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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Müşteriler</h1>
              <p className="text-slate-600 dark:text-slate-400">Tüm müşterilerinizi görüntüleyin ve yönetin</p>
            </div>
            {user.role === 'admin' && (
              <Link href="/modules/musteri/yeni">
                <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Müşteri
                </Button>
              </Link>
            )}
          </div>

          <div className="animate-fade-in">
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
      </div>
    </Layout>
  )
}

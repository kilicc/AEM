import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getWorkOrders } from '@/modules/is-emri/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@/lib/utils'
import { DataTable } from '@/components/ui/DataTable'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WorkOrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getWorkOrders(user.role === 'admin' ? undefined : user.id)
  const workOrders = result.data || []

  const statusOptions = [
    { value: 'waiting', label: 'Beklemede' },
    { value: 'in-progress', label: 'İşlemde' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'cancelled', label: 'İptal' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Düşük' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' },
  ]

  const columns = [
    {
      key: 'id',
      label: 'İş Emri No',
      render: (item: any) => (
        <Link
          href={`/modules/is-emri/${item.id}`}
          className="text-red-600 hover:text-red-700 font-semibold"
        >
          #{item.id.slice(0, 8)}
        </Link>
      ),
    },
    {
      key: 'customers',
      label: 'Müşteri',
      sortable: true,
      render: (item: any) => item.customers?.name || 'Bilinmiyor',
    },
    {
      key: 'services',
      label: 'Hizmet',
      sortable: true,
      render: (item: any) => item.services?.name || 'Bilinmiyor',
    },
    {
      key: 'users',
      label: 'Atanan',
      sortable: true,
      render: (item: any) => item.users?.name || 'Atanmamış',
    },
    {
      key: 'status',
      label: 'Durum',
      sortable: true,
      render: (item: any) => {
        const statusColors: Record<string, string> = {
          waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        }
        const statusLabels: Record<string, string> = {
          waiting: 'Beklemede',
          'in-progress': 'İşlemde',
          completed: 'Tamamlandı',
          cancelled: 'İptal',
        }
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              statusColors[item.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusLabels[item.status] || item.status}
          </span>
        )
      },
    },
    {
      key: 'priority',
      label: 'Öncelik',
      sortable: true,
      render: (item: any) => {
        if (!item.priority || item.priority === 'normal') return '-'
        const priorityColors: Record<string, string> = {
          low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        }
        const priorityLabels: Record<string, string> = {
          low: 'Düşük',
          high: 'Yüksek',
          urgent: 'Acil',
        }
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              priorityColors[item.priority] || ''
            }`}
          >
            {priorityLabels[item.priority] || item.priority}
          </span>
        )
      },
    },
    {
      key: 'created_at',
      label: 'Oluşturulma',
      sortable: true,
      render: (item: any) => formatDateTime(item.created_at),
    },
    {
      key: 'actions',
      label: 'İşlemler',
      render: (item: any) => (
        <Link href={`/modules/is-emri/${item.id}`}>
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
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {user.role === 'admin' ? 'İş Emirleri' : 'İş Emirlerim'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {user.role === 'admin' ? 'Tüm iş emirlerini görüntüleyin ve yönetin' : 'Size atanan iş emirlerini görüntüleyin'}
              </p>
            </div>
            {user.role === 'admin' && (
              <Link href="/modules/is-emri/yeni">
                <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni İş Emri
                </Button>
              </Link>
            )}
          </div>

          <div className="animate-fade-in">
            <DataTable
              title="İş Emri Listesi"
              data={workOrders}
              columns={columns}
              searchable
              searchKeys={['customers.name', 'services.name', 'users.name', 'status']}
              filterable
              filters={[
                {
                  key: 'status',
                  label: 'Durum',
                  options: statusOptions,
                },
                {
                  key: 'priority',
                  label: 'Öncelik',
                  options: priorityOptions,
                },
              ]}
              emptyMessage="Henüz iş emri bulunmuyor"
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getInvoices } from '@/modules/fatura/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { DataTable } from '@/components/ui/DataTable'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const result = await getInvoices()
  const invoices = result.data || []

  const statusOptions = [
    { value: 'draft', label: 'Taslak' },
    { value: 'sent', label: 'Gönderildi' },
    { value: 'paid', label: 'Ödendi' },
    { value: 'cancelled', label: 'İptal' },
  ]

  const columns = [
    {
      key: 'invoice_number',
      label: 'Fatura No',
      sortable: true,
      render: (item: any) => (
        <Link
          href={`/modules/fatura/${item.id}`}
          className="text-red-600 hover:text-red-700 font-semibold"
        >
          {item.invoice_number || `#${item.id.slice(0, 8)}`}
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
      key: 'issue_date',
      label: 'Tarih',
      sortable: true,
      render: (item: any) => formatDate(item.issue_date || item.created_at),
    },
    {
      key: 'total_amount',
      label: 'Toplam',
      sortable: true,
      render: (item: any) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(item.total_amount || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      sortable: true,
      render: (item: any) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
          sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        }
        const statusLabels: Record<string, string> = {
          draft: 'Taslak',
          sent: 'Gönderildi',
          paid: 'Ödendi',
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
      key: 'actions',
      label: 'İşlemler',
      render: (item: any) => (
        <Link href={`/modules/fatura/${item.id}`}>
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
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Faturalar</h1>
            <p className="text-slate-600 dark:text-slate-400">Tüm faturaları görüntüleyin ve yönetin</p>
          </div>

          <div className="animate-fade-in">
            <DataTable
              title="Fatura Listesi"
              data={invoices}
              columns={columns}
              searchable
              searchKeys={['invoice_number', 'customers.name']}
              filterable
              filters={[
                {
                  key: 'status',
                  label: 'Durum',
                  options: statusOptions,
                },
              ]}
              emptyMessage="Henüz fatura bulunmuyor"
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}

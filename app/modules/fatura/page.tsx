import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getInvoices } from '@/modules/fatura/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

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

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const statusLabels: Record<string, string> = {
    draft: 'Taslak',
    sent: 'Gönderildi',
    paid: 'Ödendi',
    cancelled: 'İptal',
  }

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Faturalar</h1>

        <div className="space-y-4">
          {invoices.map((invoice: any) => (
            <Card key={invoice.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link href={`/modules/fatura/${invoice.id}`}>
                      <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                        {invoice.invoice_number}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {invoice.customers?.name || 'Müşteri'}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Tarih: {formatDate(invoice.issue_date)}</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      statusColors[invoice.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[invoice.status] || invoice.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {invoices.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <p>Henüz fatura bulunmuyor</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}


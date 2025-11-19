import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect, notFound } from 'next/navigation'
import { getInvoice, updateInvoiceStatus } from '@/modules/fatura/actions'
import { generateInvoicePDF } from '@/modules/fatura/pdf'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import InvoicePDFViewer from './InvoicePDFViewer'

export const dynamic = 'force-dynamic'

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const result = await getInvoice(params.id)

  if (result.error || !result.data) {
    notFound()
  }

  const invoice = result.data
  const pdfHtml = await generateInvoicePDF(params.id)

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
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fatura Detayı
          </h1>
          <div className="flex items-center gap-4">
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                statusColors[invoice.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabels[invoice.status] || invoice.status}
            </span>
            <span className="text-sm text-gray-600">
              Fatura No: {invoice.invoice_number}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Fatura PDF Önizleme */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fatura</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const printWindow = window.open('', '_blank')
                      if (printWindow) {
                        printWindow.document.write(pdfHtml)
                        printWindow.document.close()
                        printWindow.print()
                      }
                    }}
                  >
                    Yazdır
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([pdfHtml], { type: 'text/html' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `fatura-${invoice.invoice_number}.html`
                      a.click()
                    }}
                  >
                    İndir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <InvoicePDFViewer html={pdfHtml} />
            </CardContent>
          </Card>

          {/* Fatura Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Fatura Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Müşteri</p>
                  <p className="font-medium">{invoice.customers?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tarih</p>
                  <p className="font-medium">{formatDate(invoice.issue_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ara Toplam</p>
                  <p className="font-medium">{formatCurrency(invoice.subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">KDV</p>
                  <p className="font-medium">{formatCurrency(invoice.tax_amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Genel Toplam</p>
                  <p className="font-medium text-2xl">{formatCurrency(invoice.total_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İş Emri Bağlantısı */}
          {invoice.work_orders && (
            <Card>
              <CardHeader>
                <CardTitle>İlgili İş Emri</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/modules/is-emri/${invoice.work_orders.id}`}>
                  <Button variant="outline">
                    İş Emrini Görüntüle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Durum Güncelleme */}
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Durum Güncelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {invoice.status === 'draft' && (
                    <form action={async () => {
                      'use server'
                      await updateInvoiceStatus(params.id, 'sent')
                    }}>
                      <Button type="submit">Gönderildi Olarak İşaretle</Button>
                    </form>
                  )}
                  {invoice.status === 'sent' && (
                    <form action={async () => {
                      'use server'
                      await updateInvoiceStatus(params.id, 'paid')
                    }}>
                      <Button type="submit" variant="default">Ödendi Olarak İşaretle</Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}


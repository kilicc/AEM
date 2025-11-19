import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect, notFound } from 'next/navigation'
import { getWorkOrder, updateWorkOrderStatus } from '@/modules/is-emri/actions'
import { ServiceFormRenderer } from '@/components/forms/ServiceFormRenderer'
import { PhotoUpload } from '@/components/forms/PhotoUpload'
import { SignaturePad } from '@/components/forms/SignaturePad'
import { CompanyStamp } from '@/components/company/CompanyStamp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'
import { uploadWorkOrderPhoto, addWorkOrderSignature } from '@/modules/is-emri/actions'
import { getProducts } from '@/modules/depo/actions'
import WorkOrderActions from './WorkOrderActions'
import WorkOrderPhotoUpload from './WorkOrderPhotoUpload'
import WorkOrderSignatureSection from './WorkOrderSignatureSection'

export const dynamic = 'force-dynamic'

export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const result = await getWorkOrder(params.id)

  if (result.error || !result.data) {
    notFound()
  }

  const workOrder = result.data
  const canEdit = user.role === 'admin' || workOrder.assigned_user_id === user.id

  // Ürünleri al (malzeme eklemek için)
  const productsResult = await getProducts()
  const products = productsResult.data || []

  return (
    <Layout>
      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            İş Emri Detayı
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Durum:{' '}
              <span
                className={`px-2 py-1 rounded ${
                  workOrder.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : workOrder.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {workOrder.status === 'completed'
                  ? 'Tamamlandı'
                  : workOrder.status === 'in-progress'
                  ? 'İşlemde'
                  : 'Beklemede'}
              </span>
            </span>
            <span>Oluşturulma: {formatDate(workOrder.created_at)}</span>
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
                  <p className="text-sm text-gray-500">Adı</p>
                  <p className="font-medium">{workOrder.customers?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-medium">{workOrder.customers?.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-medium">{workOrder.customers?.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teknik Servis Formu */}
          {workOrder.services?.form_template && (
            <Card>
              <CardHeader>
                <CardTitle>{workOrder.services.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceFormRenderer
                  template={workOrder.services.form_template}
                  customerData={workOrder.customers}
                  readOnly={!canEdit || workOrder.status === 'completed'}
                />
                <CompanyStamp />
              </CardContent>
            </Card>
          )}

          {/* Kullanılan Malzemeler */}
          <Card>
            <CardHeader>
              <CardTitle>Kullanılan Malzemeler</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.work_order_materials && workOrder.work_order_materials.length > 0 ? (
                <div className="space-y-2">
                  {workOrder.work_order_materials.map((material: any) => (
                    <div
                      key={material.id}
                      className="flex justify-between items-center p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{material.products?.name}</p>
                        <p className="text-sm text-gray-500">
                          {material.quantity} {material.products?.unit} ×{' '}
                          {formatCurrency(material.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(material.quantity * material.unit_price)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Henüz malzeme eklenmemiş</p>
              )}
            </CardContent>
          </Card>

          {/* Fotoğraflar */}
          <WorkOrderPhotoUpload
            workOrderId={params.id}
            photos={workOrder.work_order_photos || []}
            readOnly={!canEdit || workOrder.status === 'completed'}
          />

          {/* İmzalar */}
          <WorkOrderSignatureSection
            workOrderId={params.id}
            signatures={workOrder.work_order_signatures || []}
            canEdit={canEdit && workOrder.status !== 'completed'}
          />

          {/* Durum Değiştirme */}
          {canEdit && workOrder.status !== 'completed' && (
            <WorkOrderActions workOrderId={params.id} currentStatus={workOrder.status} />
          )}
        </div>
      </div>
    </Layout>
  )
}


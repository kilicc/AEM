import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getServices } from '@/modules/admin/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const servicesResult = await getServices()
  const services = servicesResult.data || []

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-600" />
                Hizmet Yönetimi
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Hizmet şablonlarını yönetin</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Hizmet
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service: any) => (
              <Card key={service.id} className="border border-gray-200 dark:border-gray-700 shadow-md">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {service.description || 'Açıklama yok'}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Düzenle
                  </Button>
                </CardContent>
              </Card>
            ))}
            {services.length === 0 && (
              <Card className="col-span-full border border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6 text-center text-gray-500 dark:text-gray-400">
                  <p>Henüz hizmet bulunmuyor</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}


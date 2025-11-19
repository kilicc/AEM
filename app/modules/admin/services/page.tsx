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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-red-600" />
                Hizmet Yönetimi
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Hizmet şablonlarını yönetin</p>
            </div>
            <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Hizmet
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {services.map((service: any, index: number) => (
              <Card key={service.id} className="border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 card-hover bg-white dark:bg-slate-900" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 min-h-[3rem]">
                    {service.description || 'Açıklama yok'}
                  </p>
                  <Button variant="outline" size="sm" className="w-full border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Düzenle
                  </Button>
                </CardContent>
              </Card>
            ))}
            {services.length === 0 && (
              <Card className="col-span-full border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                <CardContent className="pt-12 pb-12 text-center">
                  <FileText className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Henüz hizmet bulunmuyor</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Yeni bir hizmet eklemek için butona tıklayın</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}


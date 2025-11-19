import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminCustomerGroupsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-red-600" />
              Müşteri Grupları
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Müşteri segmentasyonu ve grupları</p>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Müşteri Grupları</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Bu özellik yakında eklenecek. Müşterileri gruplara ayırabileceksiniz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}


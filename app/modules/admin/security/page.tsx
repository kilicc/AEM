import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Globe } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminSecurityPage() {
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
              <Shield className="w-8 h-8 text-red-600" />
              Güvenlik Ayarları
            </h1>
            <p className="text-gray-600 dark:text-gray-400">IP kısıtlamaları ve 2FA ayarları</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="w-5 h-5 text-red-600" />
                  IP Kısıtlamaları
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Belirli IP adreslerinden erişimi kısıtlayın
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Bu özellik yakında eklenecek
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Lock className="w-5 h-5 text-red-600" />
                  İki Faktörlü Kimlik Doğrulama (2FA)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Kullanıcılar için 2FA etkinleştirme
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Bu özellik yakında eklenecek
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}


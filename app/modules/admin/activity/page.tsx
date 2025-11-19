import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getActivityLogs } from '@/modules/admin/activity-logs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminActivityPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  let logs: any[] = []
  try {
    const logsResult = await getActivityLogs({ limit: 50 })
    logs = logsResult.data || []
  } catch (error) {
    console.error('Aktivite logları yüklenemedi:', error)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-red-600" />
              Aktivite Logları
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Sistem aktivite kayıtları</p>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-md">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {logs && logs.length > 0 ? (
                  logs.map((log: any) => (
                    <div key={log.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.action || 'Aktivite'}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {log.entity_type || 'Bilinmeyen'} - {log.entity_id ? log.entity_id.slice(0, 8) : ''}
                          </p>
                          {log.user && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Kullanıcı: {log.user.name || log.user.email}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {log.created_at ? new Date(log.created_at).toLocaleString('tr-TR') : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">Henüz aktivite kaydı yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}


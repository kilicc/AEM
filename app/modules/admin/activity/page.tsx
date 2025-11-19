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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-red-600" />
              Aktivite Logları
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Sistem aktivite kayıtları</p>
          </div>

          <div className="animate-fade-in">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {logs && logs.length > 0 ? (
                    logs.map((log: any) => (
                      <div key={log.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{log.action || 'Aktivite'}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {log.entity_type || 'Bilinmeyen'} - {log.entity_id ? log.entity_id.slice(0, 8) : ''}
                            </p>
                            {log.user && (
                              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                Kullanıcı: {log.user.name || log.user.email}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              {log.created_at ? new Date(log.created_at).toLocaleString('tr-TR') : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Henüz aktivite kaydı yok</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}


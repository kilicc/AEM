import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getNotificationLogs, getNotificationTemplates } from '@/modules/notifications/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NotificationLogsTable from './NotificationLogsTable'
import NotificationTemplatesList from './NotificationTemplatesList'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const logsResult = await getNotificationLogs()
  const logs = logsResult.data || []

  const templatesResult = await getNotificationTemplates()
  const templates = templatesResult.data || []

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Bildirim Yönetimi</h1>
            <p className="text-slate-600 dark:text-slate-400">Bildirim şablonları ve loglarını yönetin</p>
          </div>

          <div className="animate-fade-in">
            <Tabs defaultValue="logs" className="space-y-4">
              <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <TabsTrigger value="logs">Bildirim Geçmişi</TabsTrigger>
                <TabsTrigger value="templates">Şablonlar</TabsTrigger>
              </TabsList>

              <TabsContent value="logs">
                <NotificationLogsTable logs={logs} />
              </TabsContent>

              <TabsContent value="templates">
                <NotificationTemplatesList templates={templates} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  )
}


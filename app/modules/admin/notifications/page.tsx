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
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Bildirim Yönetimi</h1>

        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
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
    </Layout>
  )
}


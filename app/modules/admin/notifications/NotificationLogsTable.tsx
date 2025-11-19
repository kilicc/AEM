'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'

interface NotificationLog {
  id: string
  notification_type: 'whatsapp' | 'email' | 'sms'
  recipient: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
  created_at: string
}

interface NotificationLogsTableProps {
  logs: NotificationLog[]
}

export default function NotificationLogsTable({ logs }: NotificationLogsTableProps) {
  const statusColors: Record<string, string> = {
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }

  const statusLabels: Record<string, string> = {
    sent: 'Gönderildi',
    failed: 'Başarısız',
    pending: 'Beklemede',
  }

  const typeLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    email: 'E-posta',
    sms: 'SMS',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bildirim Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Tarih</th>
                <th className="text-left p-2">Tip</th>
                <th className="text-left p-2">Alıcı</th>
                <th className="text-left p-2">Mesaj</th>
                <th className="text-left p-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{formatDateTime(log.created_at)}</td>
                  <td className="p-2">{typeLabels[log.notification_type] || log.notification_type}</td>
                  <td className="p-2">{log.recipient}</td>
                  <td className="p-2 max-w-md truncate">{log.message}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        statusColors[log.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[log.status] || log.status}
                    </span>
                    {log.error_message && (
                      <div className="text-xs text-red-600 mt-1">{log.error_message}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Henüz bildirim gönderilmemiş
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


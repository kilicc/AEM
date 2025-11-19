'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface NotificationTemplate {
  id: string
  name: string
  type: 'whatsapp' | 'email' | 'sms'
  subject?: string
  body: string
  is_active: boolean
  created_at: string
}

interface NotificationTemplatesListProps {
  templates: NotificationTemplate[]
}

export default function NotificationTemplatesList({ templates }: NotificationTemplatesListProps) {
  const typeLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    email: 'E-posta',
    sms: 'SMS',
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>Yeni Şablon</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <div className="text-sm text-gray-500">
                {typeLabels[template.type] || template.type}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {template.subject && (
                  <div>
                    <p className="text-xs text-gray-500">Konu:</p>
                    <p className="text-sm">{template.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">İçerik:</p>
                  <p className="text-sm line-clamp-3">{template.body}</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      template.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {template.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(template.created_at)}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Düzenle
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Sil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <p>Henüz şablon bulunmuyor</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


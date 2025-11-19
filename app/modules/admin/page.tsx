import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Activity, 
  FileText,
  BarChart3,
  Key,
  Upload,
  Download,
  Move,
  QrCode,
  Users as UsersGroup,
  FileText as FileTextTemplate
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  const settingsMenu = [
    {
      title: 'Bildirimler',
      description: 'Bildirim şablonları ve logları',
      icon: Bell,
      href: '/modules/admin/notifications',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcıları görüntüle ve yönet',
      icon: Users,
      href: '/modules/admin/users',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Güvenlik',
      description: 'IP kısıtlamaları ve 2FA ayarları',
      icon: Shield,
      href: '/modules/admin/security',
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Aktivite Logları',
      description: 'Sistem aktivite kayıtları',
      icon: Activity,
      href: '/modules/admin/activity',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Raporlar',
      description: 'Detaylı istatistikler ve raporlar',
      icon: BarChart3,
      href: '/modules/admin/reports',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Hizmet Yönetimi',
      description: 'Hizmet şablonlarını yönet',
      icon: FileText,
      href: '/modules/admin/services',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      title: 'Excel İçe/Dışa Aktar',
      description: 'Toplu ürün girişi ve veri aktarımı',
      icon: Upload,
      href: '/modules/admin/excel',
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Depo Transferi',
      description: 'Depo arası ürün transferi',
      icon: Move,
      href: '/modules/admin/transfer',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Barkod/QR Kod',
      description: 'Barkod ve QR kod yönetimi',
      icon: QrCode,
      href: '/modules/admin/barcode',
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Müşteri Grupları',
      description: 'Müşteri segmentasyonu ve grupları',
      icon: UsersGroup,
      href: '/modules/admin/customer-groups',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Fatura Şablonları',
      description: 'Fatura tasarımları ve şablonları',
      icon: FileTextTemplate,
      href: '/modules/admin/invoice-templates',
      color: 'from-amber-500 to-orange-500',
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Ayarlar</h1>
            <p className="text-gray-600 dark:text-gray-400">Sistem ayarlarını yönetin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsMenu.map((item, index) => {
              const Icon = item.icon
              return (
                <Link key={index} href={item.href}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}


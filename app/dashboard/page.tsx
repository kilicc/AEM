import { Layout } from '@/components/layout/Layout'
import { getCurrentUser } from '@/modules/auth/actions'
import { redirect } from 'next/navigation'
import { getWorkOrders } from '@/modules/is-emri/actions'
import { getDepots } from '@/modules/depo/actions'
import { getCustomers } from '@/modules/musteri/actions'
import { getInvoices } from '@/modules/fatura/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import DashboardStatistics from './statistics'
import StockAlertsWidget from './StockAlertsWidget'
import { 
  Warehouse, 
  Users, 
  ClipboardList, 
  FileText, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  Plus,
  TrendingUp,
  Activity,
  Package,
  Settings
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Admin için tüm veriler, kullanıcı için sadece kendi iş emirleri
  const workOrdersResult = await getWorkOrders(user.role === 'admin' ? undefined : user.id)
  const workOrders = workOrdersResult.data || []

  let depots: any[] = []
  let customers: any[] = []
  let invoices: any[] = []

  if (user.role === 'admin') {
    const depotsResult = await getDepots()
    depots = depotsResult.data || []

    const customersResult = await getCustomers()
    customers = customersResult.data || []

    const invoicesResult = await getInvoices()
    invoices = invoicesResult.data || []
  }

  const waitingOrders = workOrders.filter((wo: any) => wo.status === 'waiting')
  const inProgressOrders = workOrders.filter((wo: any) => wo.status === 'in-progress')
  const completedOrders = workOrders.filter((wo: any) => wo.status === 'completed')

  const stats = user.role === 'admin' 
    ? [
        { label: 'Toplam Depo', value: depots.length, icon: Warehouse, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
        { label: 'Toplam Müşteri', value: customers.length, icon: Users, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50 dark:bg-purple-950' },
        { label: 'Toplam İş Emri', value: workOrders.length, icon: ClipboardList, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50 dark:bg-green-950' },
        { label: 'Toplam Fatura', value: invoices.length, icon: FileText, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50 dark:bg-orange-950' },
      ]
    : [
        { label: 'Bekleyen İşler', value: waitingOrders.length, icon: Clock, color: 'from-yellow-500 to-amber-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950' },
        { label: 'Devam Eden İşler', value: inProgressOrders.length, icon: PlayCircle, color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
        { label: 'Tamamlanan İşler', value: completedOrders.length, icon: CheckCircle2, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50 dark:bg-green-950' },
      ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
                  Hoş Geldiniz, {user.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              {user.role === 'admin' && (
                <Link href="/modules/is-emri/yeni">
                  <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 w-full sm:w-auto">
                    <Plus className="w-5 h-5" />
                    Yeni İş Emri
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-gray-50 dark:from-red-900/10 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-red-600 shadow-md">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        +12%
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Recent Work Orders */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                      <Activity className="w-5 h-5 text-red-600" />
                      Son İş Emirleri
                    </CardTitle>
                    <Link href="/modules/is-emri">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                        Tümünü Gör
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {workOrders.slice(0, 5).map((order: any) => {
                      const statusConfig = {
                        completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
                        'in-progress': { label: 'İşlemde', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: PlayCircle },
                        waiting: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
                      }
                      const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.waiting
                      const StatusIcon = config.icon

                      return (
                        <Link
                          key={order.id}
                          href={`/modules/is-emri/${order.id}`}
                          className="block group"
                        >
                          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-700/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="p-1.5 rounded bg-red-50 dark:bg-red-900/30">
                                    <Package className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                      {order.customers?.name || 'Müşteri'}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {order.services?.name || 'Hizmet'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 ml-8">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                    {workOrders.length === 0 && (
                      <div className="text-center py-8">
                        <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Henüz iş emri yok</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yeni iş emri oluşturmak için butona tıklayın</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            {user.role === 'admin' && (
              <div>
                <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                      <Activity className="w-5 h-5 text-red-600" />
                      Hızlı İşlemler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Link href="/modules/is-emri/yeni">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 h-11 text-sm font-semibold">
                          <Plus className="w-4 h-4 mr-2" />
                          Yeni İş Emri
                        </Button>
                      </Link>
                      <Link href="/modules/musteri/yeni">
                        <Button className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 h-11 text-sm font-semibold">
                          <Users className="w-4 h-4 mr-2" />
                          Yeni Müşteri
                        </Button>
                      </Link>
                      <Link href="/modules/depo/yeni">
                        <Button className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 h-11 text-sm font-semibold">
                          <Warehouse className="w-4 h-4 mr-2" />
                          Yeni Depo
                        </Button>
                      </Link>
                      <Link href="/modules/admin">
                        <Button className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 h-11 text-sm font-semibold">
                          <Settings className="w-4 h-4 mr-2" />
                          Ayarlar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Stock Alerts Section */}
          {user.role === 'admin' && (
            <div className="mt-6">
              <StockAlertsWidget />
            </div>
          )}

          {/* Statistics Section */}
          {user.role === 'admin' && (
            <div className="mt-6">
              <DashboardStatistics />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

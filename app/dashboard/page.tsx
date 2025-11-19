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
  Package
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Hoş Geldiniz, {user.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
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
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Yeni İş Emri
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`px-3 py-1 rounded-full ${stat.bgColor} text-xs font-semibold text-gray-700 dark:text-gray-300`}>
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        +12%
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Work Orders */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Son İş Emirleri
                    </CardTitle>
                    <Link href="/modules/is-emri">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        Tümünü Gör
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {workOrders.slice(0, 5).map((order: any) => {
                      const statusConfig = {
                        completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
                        'in-progress': { label: 'İşlemde', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: PlayCircle },
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
                          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-700/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {order.customers?.name || 'Müşteri'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {order.services?.name || 'Hizmet'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 ml-11">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${config.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {config.label}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                    {workOrders.length === 0 && (
                      <div className="text-center py-12">
                        <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz iş emri yok</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Yeni iş emri oluşturmak için butona tıklayın</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            {user.role === 'admin' && (
              <div>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
                  <CardHeader className="border-b border-blue-200 dark:border-gray-700">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Hızlı İşlemler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Link href="/modules/is-emri/yeni">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-semibold">
                          <Plus className="w-5 h-5 mr-2" />
                          Yeni İş Emri Oluştur
                        </Button>
                      </Link>
                      <Link href="/modules/musteri/yeni">
                        <Button className="w-full bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 h-12 text-base font-semibold">
                          <Users className="w-5 h-5 mr-2" />
                          Yeni Müşteri Ekle
                        </Button>
                      </Link>
                      <Link href="/modules/depo/yeni">
                        <Button className="w-full bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 h-12 text-base font-semibold">
                          <Warehouse className="w-5 h-5 mr-2" />
                          Yeni Depo Oluştur
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Statistics Section */}
          {user.role === 'admin' && (
            <div className="mt-8">
              <DashboardStatistics />
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

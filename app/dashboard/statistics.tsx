'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStatistics } from '@/modules/admin/statistics'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function DashboardStatistics() {
  const [stats, setStats] = useState<any>(null)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      const result = await getDashboardStatistics(period)
      if (result.data) {
        setStats(result.data)
      }
      setLoading(false)
    }
    loadStats()
  }, [period])

  if (loading || !stats) {
    return <div className="text-center py-8">Yükleniyor...</div>
  }

  const workOrderStatusData = [
    { name: 'Beklemede', value: stats.workOrders.byStatus.waiting },
    { name: 'İşlemde', value: stats.workOrders.byStatus['in-progress'] },
    { name: 'Tamamlandı', value: stats.workOrders.byStatus.completed },
    { name: 'İptal', value: stats.workOrders.byStatus.cancelled },
  ]

  const invoiceStatusData = [
    { name: 'Taslak', value: stats.invoices.byStatus.draft },
    { name: 'Gönderildi', value: stats.invoices.byStatus.sent },
    { name: 'Ödendi', value: stats.invoices.byStatus.paid },
    { name: 'İptal', value: stats.invoices.byStatus.cancelled },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">İstatistikler</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="day">Günlük</option>
          <option value="week">Haftalık</option>
          <option value="month">Aylık</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Günlük Trend */}
        <Card>
          <CardHeader>
            <CardTitle>İş Emri Trendi (Son 30 Gün)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="İş Emri Sayısı" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* İş Emri Durumları */}
        <Card>
          <CardHeader>
            <CardTitle>İş Emri Durumları</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workOrderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workOrderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fatura Durumları */}
        <Card>
          <CardHeader>
            <CardTitle>Fatura Durumları</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={invoiceStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Öncelik Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>İş Emri Öncelikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Düşük', value: stats.workOrders.byPriority.low },
                  { name: 'Normal', value: stats.workOrders.byPriority.normal },
                  { name: 'Yüksek', value: stats.workOrders.byPriority.high },
                  { name: 'Acil', value: stats.workOrders.byPriority.urgent },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


'use server'

import { createServerClient } from '@/lib/supabase'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns'

// Dashboard istatistikleri
export async function getDashboardStatistics(period: 'day' | 'week' | 'month' = 'month') {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const now = new Date()
  let startDate: Date
  let endDate: Date = now

  switch (period) {
    case 'day':
      startDate = startOfDay(now)
      endDate = endOfDay(now)
      break
    case 'week':
      startDate = startOfWeek(now)
      endDate = endOfWeek(now)
      break
    case 'month':
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break
  }

  // İş emri istatistikleri
  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('status, priority, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Fatura istatistikleri
  const { data: invoices } = await supabase
    .from('invoices')
    .select('status, total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Müşteri istatistikleri
  const { data: customers } = await supabase
    .from('customers')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Günlük iş emri trendi (son 30 gün)
  const dailyTrend = []
  for (let i = 29; i >= 0; i--) {
    const date = subDays(now, i)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const { count } = await supabase
      .from('work_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString())

    dailyTrend.push({
      date: date.toISOString().split('T')[0],
      count: count || 0,
    })
  }

  const stats = {
    workOrders: {
      total: workOrders?.length || 0,
      byStatus: {
        waiting: workOrders?.filter((wo: any) => wo.status === 'waiting').length || 0,
        'in-progress': workOrders?.filter((wo: any) => wo.status === 'in-progress').length || 0,
        completed: workOrders?.filter((wo: any) => wo.status === 'completed').length || 0,
        cancelled: workOrders?.filter((wo: any) => wo.status === 'cancelled').length || 0,
      },
      byPriority: {
        low: workOrders?.filter((wo: any) => wo.priority === 'low').length || 0,
        normal: workOrders?.filter((wo: any) => wo.priority === 'normal').length || 0,
        high: workOrders?.filter((wo: any) => wo.priority === 'high').length || 0,
        urgent: workOrders?.filter((wo: any) => wo.priority === 'urgent').length || 0,
      },
    },
    invoices: {
      total: invoices?.length || 0,
      totalAmount: invoices?.reduce((sum: number, inv: any) => sum + Number(inv.total_amount || 0), 0) || 0,
      byStatus: {
        draft: invoices?.filter((inv: any) => inv.status === 'draft').length || 0,
        sent: invoices?.filter((inv: any) => inv.status === 'sent').length || 0,
        paid: invoices?.filter((inv: any) => inv.status === 'paid').length || 0,
        cancelled: invoices?.filter((inv: any) => inv.status === 'cancelled').length || 0,
      },
    },
    customers: {
      new: customers?.length || 0,
    },
    dailyTrend,
  }

  return { data: stats }
}


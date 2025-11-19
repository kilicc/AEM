'use server'

import { createServerClient } from '@/lib/supabase'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns'

// Dashboard istatistikleri
export async function getDashboardStatistics(period: 'day' | 'week' | 'month' = 'month') {
  const supabase = await createServerClient()

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

// Çalışan performans raporları
export async function getEmployeePerformanceReports(userId?: string, period: 'day' | 'week' | 'month' = 'month') {
  const supabase = await createServerClient()

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

  let query = supabase
    .from('work_orders')
    .select(`
      assigned_user_id,
      status,
      created_at,
      started_at,
      completed_at,
      assigned_user:users!work_orders_assigned_user_id_fkey(id, name, email)
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (userId) {
    query = query.eq('assigned_user_id', userId)
  }

  const { data: workOrders } = await query

  // Kullanıcı bazında grupla
  const userStats: Record<string, any> = {}

  workOrders?.forEach((wo: any) => {
    const uid = wo.assigned_user_id
    if (!userStats[uid]) {
      userStats[uid] = {
        user: wo.assigned_user,
        total: 0,
        completed: 0,
        inProgress: 0,
        waiting: 0,
        cancelled: 0,
        averageCompletionTime: 0,
        totalCompletionTime: 0,
        completionCount: 0,
      }
    }

    userStats[uid].total++
    if (wo.status === 'completed') {
      userStats[uid].completed++
      if (wo.started_at && wo.completed_at) {
        const start = new Date(wo.started_at)
        const end = new Date(wo.completed_at)
        const diff = (end.getTime() - start.getTime()) / (1000 * 60) // dakika cinsinden
        userStats[uid].totalCompletionTime += diff
        userStats[uid].completionCount++
      }
    } else if (wo.status === 'in-progress') {
      userStats[uid].inProgress++
    } else if (wo.status === 'waiting') {
      userStats[uid].waiting++
    } else if (wo.status === 'cancelled') {
      userStats[uid].cancelled++
    }
  })

  // Ortalama tamamlanma süresini hesapla
  Object.keys(userStats).forEach((uid) => {
    const stats = userStats[uid]
    if (stats.completionCount > 0) {
      stats.averageCompletionTime = Math.round(stats.totalCompletionTime / stats.completionCount)
    }
  })

  return { data: Object.values(userStats) }
}

// Müşteri istatistikleri
export async function getCustomerStatistics(period: 'day' | 'week' | 'month' = 'month') {
  const supabase = await createServerClient()

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

  // En çok hizmet alan müşteriler
  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('customer_id, customers(id, name, email, phone)')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const customerCounts: Record<string, any> = {}

  workOrders?.forEach((wo: any) => {
    const cid = wo.customer_id
    if (!customerCounts[cid]) {
      customerCounts[cid] = {
        customer: wo.customers,
        workOrderCount: 0,
        totalRevenue: 0,
      }
    }
    customerCounts[cid].workOrderCount++
  })

  // Faturalardan gelir hesapla
  const { data: invoices } = await supabase
    .from('invoices')
    .select('customer_id, total_amount')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  invoices?.forEach((inv: any) => {
    if (customerCounts[inv.customer_id]) {
      customerCounts[inv.customer_id].totalRevenue += Number(inv.total_amount || 0)
    }
  })

  const topCustomers = Object.values(customerCounts)
    .sort((a: any, b: any) => b.workOrderCount - a.workOrderCount)
    .slice(0, 10)

  return { data: topCustomers }
}

// Gelir raporları
export async function getRevenueReports(period: 'day' | 'week' | 'month' = 'month') {
  const supabase = await createServerClient()

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

  // Fatura toplamları
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount, subtotal, tax_amount, status, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Malzeme kullanımı
  const { data: materials } = await supabase
    .from('work_order_materials')
    .select(`
      quantity,
      unit_price,
      products(name, unit),
      work_orders!inner(created_at)
    `)
    .gte('work_orders.created_at', startDate.toISOString())
    .lte('work_orders.created_at', endDate.toISOString())

  const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.total_amount || 0), 0) || 0
  const totalSubtotal = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.subtotal || 0), 0) || 0
  const totalTax = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.tax_amount || 0), 0) || 0

  // Malzeme kullanım istatistikleri
  const materialUsage: Record<string, any> = {}

  materials?.forEach((mat: any) => {
    const productName = mat.products?.name || 'Bilinmeyen'
    if (!materialUsage[productName]) {
      materialUsage[productName] = {
        name: productName,
        unit: mat.products?.unit || 'adet',
        totalQuantity: 0,
        totalValue: 0,
      }
    }
    materialUsage[productName].totalQuantity += Number(mat.quantity || 0)
    materialUsage[productName].totalValue += Number(mat.quantity || 0) * Number(mat.unit_price || 0)
  })

  return {
    data: {
      invoices: {
        total: invoices?.length || 0,
        totalRevenue,
        totalSubtotal,
        totalTax,
        byStatus: {
          draft: invoices?.filter((inv: any) => inv.status === 'draft').length || 0,
          sent: invoices?.filter((inv: any) => inv.status === 'sent').length || 0,
          paid: invoices?.filter((inv: any) => inv.status === 'paid').length || 0,
          cancelled: invoices?.filter((inv: any) => inv.status === 'cancelled').length || 0,
        },
      },
      materialUsage: Object.values(materialUsage),
    },
  }
}


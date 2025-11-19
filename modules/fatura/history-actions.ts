'use server'

import { createServerClient } from '@/lib/supabase'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns'

// Fatura geçmişi ve arşiv
export async function getInvoiceHistory(filters?: {
  status?: string
  date_from?: string
  date_to?: string
  customer_id?: string
  archived?: boolean
  limit?: number
}) {
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

  let query = supabase
    .from('invoices')
    .select(`
      *,
      customers(id, name, email, phone),
      work_orders(id, status),
      invoice_items(*),
      invoice_payments(*)
    `)
    .order('created_at', { ascending: false })

  // Filtreler
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  // Arşivlenmiş faturalar (6 aydan eski)
  if (filters?.archived) {
    const sixMonthsAgo = subMonths(new Date(), 6)
    query = query.lte('created_at', sixMonthsAgo.toISOString())
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  // Her fatura için ödeme durumunu hesapla
  const invoicesWithPaymentStatus = data?.map((invoice: any) => {
    const totalPaid = invoice.invoice_payments?.reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    ) || 0

    const paymentStatus = totalPaid >= Number(invoice.total_amount || 0)
      ? 'paid'
      : totalPaid > 0
      ? 'partial'
      : 'unpaid'

    return {
      ...invoice,
      totalPaid,
      paymentStatus,
      remainingAmount: Number(invoice.total_amount || 0) - totalPaid,
    }
  })

  return { data: invoicesWithPaymentStatus }
}

// Fatura arşivleme (eski faturaları arşivle)
export async function archiveInvoices(olderThanMonths = 6) {
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

  const cutoffDate = subMonths(new Date(), olderThanMonths)

  // Arşivlenmiş faturaları getir (sadece okuma için)
  const { data: archivedInvoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, created_at, status, total_amount')
    .lte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return {
    data: {
      archivedCount: archivedInvoices?.length || 0,
      archivedInvoices,
      cutoffDate: cutoffDate.toISOString(),
    },
  }
}

// Fatura istatistikleri (geçmiş bazlı)
export async function getInvoiceHistoryStatistics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
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
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31)
      break
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('status, total_amount, created_at, issue_date')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const { data: payments } = await supabase
    .from('invoice_payments')
    .select('amount, payment_date, payment_method')
    .gte('payment_date', startDate.toISOString().split('T')[0])
    .lte('payment_date', endDate.toISOString().split('T')[0])

  const totalInvoiced = invoices?.reduce((sum: number, inv: any) => sum + Number(inv.total_amount || 0), 0) || 0
  const totalPaid = payments?.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0
  const totalUnpaid = totalInvoiced - totalPaid

  // Ödeme yöntemine göre dağılım
  const paymentMethodDistribution: Record<string, number> = {}
  payments?.forEach((p: any) => {
    const method = p.payment_method || 'other'
    paymentMethodDistribution[method] = (paymentMethodDistribution[method] || 0) + Number(p.amount || 0)
  })

  return {
    data: {
      period,
      totalInvoices: invoices?.length || 0,
      totalInvoiced,
      totalPaid,
      totalUnpaid,
      paymentRate: totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0,
      byStatus: {
        draft: invoices?.filter((inv: any) => inv.status === 'draft').length || 0,
        sent: invoices?.filter((inv: any) => inv.status === 'sent').length || 0,
        paid: invoices?.filter((inv: any) => inv.status === 'paid').length || 0,
        cancelled: invoices?.filter((inv: any) => inv.status === 'cancelled').length || 0,
      },
      paymentMethodDistribution,
    },
  }
}


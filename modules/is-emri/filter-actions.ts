'use server'

import { createServerClient } from '@/lib/supabase'

// Gelişmiş iş emri filtreleme
export async function getFilteredWorkOrders(filters: {
  status?: string
  priority?: string
  assigned_user_id?: string
  customer_id?: string
  service_id?: string
  date_from?: string
  date_to?: string
  search?: string
}) {
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

  let query = supabase
    .from('work_orders')
    .select(`
      *,
      customers(id, name, email, phone),
      services(id, name),
      assigned_user:users!work_orders_assigned_user_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false })

  // Kullanıcılar sadece kendi iş emirlerini görebilir
  if (profile?.role !== 'admin') {
    query = query.eq('assigned_user_id', user.id)
  }

  // Filtreler
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }

  if (filters.assigned_user_id) {
    query = query.eq('assigned_user_id', filters.assigned_user_id)
  }

  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  if (filters.service_id) {
    query = query.eq('service_id', filters.service_id)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  if (filters.search) {
    // Müşteri adı veya notlarda arama
    query = query.or(`notes.ilike.%${filters.search}%,customers.name.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}


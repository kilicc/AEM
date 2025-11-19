'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Müşteri grubu oluştur
export async function createCustomerGroup(name: string, description?: string) {
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

  const { data, error } = await supabase
    .from('customer_groups')
    .insert({ name, description })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/musteri')

  return { data }
}

// Müşteri gruplarını getir
export async function getCustomerGroups() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('customer_groups')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Müşteriyi gruba ekle
export async function addCustomerToGroup(customerId: string, groupId: string) {
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

  const { data, error } = await supabase
    .from('customer_group_members')
    .insert({ customer_id: customerId, group_id: groupId })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/musteri')

  return { data }
}

// Müşteri özel günü ekle
export async function addCustomerSpecialDay(data: {
  customer_id: string
  day_type: 'birthday' | 'anniversary' | 'custom'
  day_date: string
  description?: string
  reminder_days_before?: number
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

  if (profile?.role !== 'admin') {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: specialDay, error } = await supabase
    .from('customer_special_days')
    .insert({
      ...data,
      reminder_days_before: data.reminder_days_before || 7,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/musteri')

  return { data: specialDay }
}

// Yaklaşan özel günleri getir
export async function getUpcomingSpecialDays(daysAhead = 30) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + daysAhead)

  const { data, error } = await supabase
    .from('customer_special_days')
    .select(`
      *,
      customer:customers(id, name, email, phone)
    `)
    .gte('day_date', today.toISOString().split('T')[0])
    .lte('day_date', futureDate.toISOString().split('T')[0])
    .eq('is_active', true)
    .order('day_date', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}


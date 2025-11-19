'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Müşteri puanlama ekle
export async function addCustomerRating(data: {
  customer_id: string
  work_order_id?: string
  rating: number
  comment?: string
}) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  if (data.rating < 1 || data.rating > 5) {
    return { error: 'Puan 1-5 arasında olmalıdır' }
  }

  const { data: rating, error } = await supabase
    .from('customer_ratings')
    .insert({
      ...data,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/modules/musteri/${data.customer_id}`)

  return { data: rating }
}

// Müşteri puanlamalarını getir
export async function getCustomerRatings(customerId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('customer_ratings')
    .select(`
      *,
      work_order:work_orders(id, service_id, services(name))
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Ortalama puanı hesapla
  const avgRating = data?.length > 0
    ? data.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / data.length
    : 0

  return { data, averageRating: avgRating }
}


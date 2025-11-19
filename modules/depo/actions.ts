'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { Depot, Product, UnitType } from '@/lib/types'

export async function createDepot(name: string, address?: string) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('depots')
    .insert({
      name,
      address,
      admin_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')
  return { data }
}

export async function getDepots() {
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

  let query = supabase.from('depots').select('*')

  if (profile?.role !== 'admin') {
    // Kullanıcılar tüm depoları görebilir (sadece okuma)
    query = query
  } else {
    // Adminler kendi depolarını görür
    query = query.eq('admin_id', user.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function addProduct(
  depotId: string,
  name: string,
  unit: UnitType,
  unitPrice: number,
  quantity: number,
  type: 'product' | 'tool'
) {
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
    .from('products')
    .insert({
      depot_id: depotId,
      name,
      unit,
      unit_price: unitPrice,
      quantity,
      type,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')
  return { data }
}

export async function getProducts(depotId?: string) {
  const supabase = await createServerClient()
  
  let query = supabase.from('products').select('*, depots(name)')

  if (depotId) {
    query = query.eq('depot_id', depotId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function updateProductQuantity(
  productId: string,
  quantity: number
) {
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
    .from('products')
    .update({ quantity })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Stok uyarılarını kontrol et
  const { checkStockAlerts } = await import('./stock-alerts')
  await checkStockAlerts()

  revalidatePath('/modules/depo')
  return { data }
}


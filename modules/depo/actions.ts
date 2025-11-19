'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { Depot, Product, UnitType } from '@/lib/types'

export async function createDepot(name: string, address?: string) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
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
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let query = supabase.from('depots').select('*')

  if (profile?.role !== 'admin') {
    // Users can see all depots (read-only)
    query = query
  } else {
    // Admins see their own depots
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
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
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
  const supabase = createServerClient()
  
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
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
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

  revalidatePath('/modules/depo')
  return { data }
}


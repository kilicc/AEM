'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Depo transferi yap
export async function transferProduct(data: {
  product_id: string
  from_depot_id: string
  to_depot_id: string
  quantity: number
  notes?: string
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

  if (data.from_depot_id === data.to_depot_id) {
    return { error: 'Kaynak ve hedef depo aynı olamaz' }
  }

  // Ürünü kontrol et
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('quantity, depot_id')
    .eq('id', data.product_id)
    .single()

  if (productError || !product) {
    return { error: 'Ürün bulunamadı' }
  }

  if (product.depot_id !== data.from_depot_id) {
    return { error: 'Ürün belirtilen depoda bulunmuyor' }
  }

  if (Number(product.quantity) < data.quantity) {
    return { error: 'Yetersiz stok' }
  }

  // Transfer işlemi
  const { error: transferError } = await supabase
    .from('depot_transfers')
    .insert({
      product_id: data.product_id,
      from_depot_id: data.from_depot_id,
      to_depot_id: data.to_depot_id,
      quantity: data.quantity,
      transferred_by: user.id,
      notes: data.notes,
    })

  if (transferError) {
    return { error: transferError.message }
  }

  // Kaynak depodan düş
  const { error: updateFromError } = await supabase
    .from('products')
    .update({ quantity: Number(product.quantity) - data.quantity })
    .eq('id', data.product_id)

  if (updateFromError) {
    return { error: updateFromError.message }
  }

  // Hedef depoda ürün var mı kontrol et
  const { data: targetProduct } = await supabase
    .from('products')
    .select('id, quantity')
    .eq('id', data.product_id)
    .eq('depot_id', data.to_depot_id)
    .single()

  if (targetProduct) {
    // Varsa miktarı artır
    await supabase
      .from('products')
      .update({ quantity: Number(targetProduct.quantity) + data.quantity })
      .eq('id', targetProduct.id)
  } else {
    // Yoksa yeni ürün oluştur
    const { data: sourceProduct } = await supabase
      .from('products')
      .select('name, unit, unit_price, type')
      .eq('id', data.product_id)
      .single()

    if (sourceProduct) {
      await supabase
        .from('products')
        .insert({
          depot_id: data.to_depot_id,
          name: sourceProduct.name,
          unit: sourceProduct.unit,
          unit_price: sourceProduct.unit_price,
          type: sourceProduct.type,
          quantity: data.quantity,
        })
    }
  }

  revalidatePath('/modules/depo')

  return { success: true }
}

// Transfer geçmişini getir
export async function getDepotTransfers(depotId?: string, limit = 50) {
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

  let query = supabase
    .from('depot_transfers')
    .select(`
      *,
      product:products(id, name, unit),
      from_depot:depots!depot_transfers_from_depot_id_fkey(id, name),
      to_depot:depots!depot_transfers_to_depot_id_fkey(id, name),
      transferred_by:users!depot_transfers_transferred_by_fkey(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (depotId) {
    query = query.or(`from_depot_id.eq.${depotId},to_depot_id.eq.${depotId}`)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}


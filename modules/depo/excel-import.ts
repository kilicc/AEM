'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Excel'den toplu ürün girişi
export async function importProductsFromExcel(
  depotId: string,
  products: Array<{
    name: string
    unit: 'adet' | 'metre' | 'kilogram' | 'litre' | 'metrekare' | 'metrekup'
    unit_price: number
    quantity: number
    type: 'product' | 'tool'
    category_id?: string
    barcode?: string
  }>
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

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const product of products) {
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          depot_id: depotId,
          name: product.name,
          unit: product.unit,
          unit_price: product.unit_price,
          quantity: product.quantity,
          type: product.type,
          category_id: product.category_id,
          barcode: product.barcode,
        })

      if (error) {
        results.failed++
        results.errors.push(`${product.name}: ${error.message}`)
      } else {
        results.success++
      }
    } catch (err: any) {
      results.failed++
      results.errors.push(`${product.name}: ${err.message}`)
    }
  }

  revalidatePath('/modules/depo')

  return { data: results }
}


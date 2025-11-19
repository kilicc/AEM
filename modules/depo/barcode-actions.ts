'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Barkod/QR kod oluştur ve ürüne ekle
export async function generateBarcode(productId: string) {
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

  // Basit barkod oluştur (gerçek uygulamada barkod kütüphanesi kullanılabilir)
  const barcode = `BC-${productId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  const qrCode = `QR-${productId}-${Date.now()}`

  const { data, error } = await supabase
    .from('products')
    .update({ barcode, qr_code: qrCode })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')

  return { data: { barcode, qr_code: qrCode } }
}

// Barkod ile ürün ara
export async function findProductByBarcode(barcode: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, depots(id, name), product_categories(id, name)')
    .eq('barcode', barcode)
    .single()

  if (error) {
    return { error: 'Ürün bulunamadı' }
  }

  return { data }
}


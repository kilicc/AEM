'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { sendNotificationWithLog } from '@/modules/notifications/actions'

// Stok uyarısı oluştur
export async function createStockAlert(productId: string, thresholdQuantity: number) {
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
    .from('stock_alerts')
    .insert({
      product_id: productId,
      threshold_quantity: thresholdQuantity,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')
  return { data }
}

// Stok uyarılarını kontrol et ve bildirim gönder
export async function checkStockAlerts() {
  const supabase = await createServerClient()

  // Aktif uyarıları getir
  const { data: alerts } = await supabase
    .from('stock_alerts')
    .select('*, products(*, depots(*))')
    .eq('is_active', true)

  if (!alerts || alerts.length === 0) {
    return { data: [] }
  }

  const lowStockProducts: any[] = []

  for (const alert of alerts) {
    const product = alert.products
    if (product && Number(product.quantity) <= Number(alert.threshold_quantity)) {
      lowStockProducts.push({
        alert,
        product,
        currentQuantity: product.quantity,
        threshold: alert.threshold_quantity,
      })
    }
  }

  // Admin'lere bildirim gönder
  if (lowStockProducts.length > 0) {
    const { data: admins } = await supabase
      .from('users')
      .select('id, phone, email, name')
      .eq('role', 'admin')

    if (admins) {
      for (const admin of admins) {
        const message = `⚠️ Düşük Stok Uyarısı!\n\n${lowStockProducts.map((item) => 
          `• ${item.product.name} (${item.product.depots?.name || 'Depo'}): ${item.currentQuantity} ${item.product.unit} (Eşik: ${item.threshold} ${item.product.unit})`
        ).join('\n')}`

        if (admin.phone) {
          await sendNotificationWithLog(
            admin.id,
            'whatsapp',
            admin.phone,
            message,
            undefined,
            { type: 'low_stock_alert', products: lowStockProducts }
          )
        }

        if (admin.email) {
          await sendNotificationWithLog(
            admin.id,
            'email',
            admin.email,
            message,
            'Düşük Stok Uyarısı',
            { type: 'low_stock_alert', products: lowStockProducts }
          )
        }
      }
    }
  }

  return { data: lowStockProducts }
}

// Stok uyarılarını getir
export async function getStockAlerts() {
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
    .from('stock_alerts')
    .select('*, products(*, depots(*))')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}


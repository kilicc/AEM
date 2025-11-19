'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { WorkOrderStatus } from '@/lib/types'
// Bildirimler artık sendNotificationWithLog ile yapılıyor

export async function createWorkOrder(data: {
  customer_id: string
  service_id: string
  assigned_user_id: string
  notes?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
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

  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .insert({
      ...data,
      status: 'waiting',
      priority: data.priority || 'normal',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Atanan kullanıcıya WhatsApp ve e-posta bildirimleri gönder
  try {
    // Bildirim ayarlarını kontrol et
    const { data: notificationSettings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', data.assigned_user_id)
      .single()

    const settings = notificationSettings || {
      whatsapp_enabled: true,
      email_enabled: true,
      work_order_created: true,
    }

    if (!settings.work_order_created) {
      // Kullanıcı bildirimleri kapalı
      return { data: workOrder }
    }

    const { data: assignedUser } = await supabase
      .from('users')
      .select('phone, email, name')
      .eq('id', data.assigned_user_id)
      .single()

    const { data: customer } = await supabase
      .from('customers')
      .select('name, address')
      .eq('id', data.customer_id)
      .single()

    const { data: service } = await supabase
      .from('services')
      .select('name')
      .eq('id', data.service_id)
      .single()

    if (assignedUser) {
      const priorityText = data.priority === 'urgent' ? '🚨 ACİL' : 
                          data.priority === 'high' ? '⚠️ Yüksek' :
                          data.priority === 'low' ? '📌 Düşük' : '📋 Normal'
      
      const message = `Yeni iş emri oluşturuldu!\n\n${priorityText}\nMüşteri: ${customer?.name || 'Bilinmiyor'}\nHizmet: ${service?.name || 'Bilinmiyor'}\nAdres: ${customer?.address || 'Bilinmiyor'}\n\nDetaylar için sisteme giriş yapın.`
      
      if (assignedUser.phone && settings.whatsapp_enabled) {
        const { sendNotificationWithLog } = await import('@/modules/notifications/actions')
        await sendNotificationWithLog(
          data.assigned_user_id,
          'whatsapp',
          assignedUser.phone,
          message,
          undefined,
          { work_order_id: workOrder.id, type: 'work_order_created' }
        )
      }

      if (assignedUser.email && settings.email_enabled) {
        const { sendNotificationWithLog } = await import('@/modules/notifications/actions')
        await sendNotificationWithLog(
          data.assigned_user_id,
          'email',
          assignedUser.email,
          message,
          'Yeni İş Emri Oluşturuldu',
          { work_order_id: workOrder.id, type: 'work_order_created' }
        )
      }
    }
  } catch (notificationError) {
    console.error('Bildirim hatası:', notificationError)
    // Bildirim başarısız olsa bile iş emri oluşturmayı başarısız yapma
  }

  revalidatePath('/modules/is-emri')
  return { data: workOrder }
}

export async function getWorkOrders(userId?: string) {
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
    .select('*, customers(*), services(*), users!work_orders_assigned_user_id_fkey(name, email)')

  if (profile?.role !== 'admin') {
    // Kullanıcılar sadece kendilerine atanan iş emirlerini görür
    query = query.eq('assigned_user_id', user.id)
  } else if (userId) {
    // Admin kullanıcıya göre filtreleyebilir
    query = query.eq('assigned_user_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getWorkOrder(workOrderId: string) {
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

  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      customers(*, customer_devices(*)),
      services(*),
      users!work_orders_assigned_user_id_fkey(*),
      work_order_materials(*, products(*)),
      work_order_photos(*),
      work_order_signatures(*)
    `)
    .eq('id', workOrderId)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Check authorization
  if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  return { data: workOrder }
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  status: WorkOrderStatus,
  location?: { lat: number; lng: number; address?: string }
) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'İş emri bulunamadı' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Sadece atanan kullanıcı veya admin durumu güncelleyebilir
  if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'in-progress' && location) {
    updateData.location_lat = location.lat
    updateData.location_lng = location.lng
    updateData.location_address = location.address
    updateData.started_at = new Date().toISOString()
  }

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('work_orders')
    .update(updateData)
    .eq('id', workOrderId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Durum değiştiğinde admin'e bildirim gönder
  if (status === 'in-progress' || status === 'completed') {
    try {
      const { sendNotificationWithLog } = await import('@/modules/notifications/actions')
      
      const { data: admins } = await supabase
        .from('users')
        .select('id, phone, email, name')
        .eq('role', 'admin')

      const { data: assignedUser } = await supabase
        .from('users')
        .select('name')
        .eq('id', workOrder.assigned_user_id)
        .single()

      const { data: customer } = await supabase
        .from('customers')
        .select('name')
        .eq('id', workOrder.customer_id)
        .single()

      const statusText = status === 'in-progress' ? 'İşlemde' : 'Tamamlandı'
      const message = `İş emri durumu değişti!\n\nİş Emri ID: ${workOrderId}\nMüşteri: ${customer?.name || 'Bilinmiyor'}\nÇalışan: ${assignedUser?.name || 'Bilinmiyor'}\nYeni Durum: ${statusText}${location?.address ? `\nKonum: ${location.address}` : ''}`

      if (admins) {
        for (const admin of admins) {
          const { data: adminSettings } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', admin.id)
            .single()

          const settings = adminSettings || {
            whatsapp_enabled: true,
            email_enabled: true,
            work_order_status_changed: true,
          }

          if (settings.work_order_status_changed) {
            if (admin.phone && settings.whatsapp_enabled) {
              await sendNotificationWithLog(
                admin.id,
                'whatsapp',
                admin.phone,
                message,
                undefined,
                { work_order_id: workOrderId, type: 'work_order_status_changed', status }
              )
            }
            if (admin.email && settings.email_enabled) {
              await sendNotificationWithLog(
                admin.id,
                'email',
                admin.email,
                message,
                `İş Emri Durumu: ${statusText}`,
                { work_order_id: workOrderId, type: 'work_order_status_changed', status }
              )
            }
          }
        }
      }
    } catch (notificationError) {
      console.error('Admin bildirim hatası:', notificationError)
      // Bildirim başarısız olsa bile durum güncellemesini başarısız yapma
    }
  }

  revalidatePath('/modules/is-emri')
  return { data }
}

export async function addWorkOrderMaterial(
  workOrderId: string,
  productId: string,
  quantity: number,
  unitPrice: number
) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'İş emri bulunamadı' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Sadece atanan kullanıcı veya admin malzeme ekleyebilir
  if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('work_order_materials')
    .insert({
      work_order_id: workOrderId,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Depodaki ürün miktarını güncelle
  const { data: product } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', productId)
    .single()

  if (product) {
    await supabase
      .from('products')
      .update({ quantity: product.quantity - quantity })
      .eq('id', productId)
  }

  revalidatePath(`/modules/is-emri/${workOrderId}`)
  return { data }
}

export async function uploadWorkOrderPhoto(
  workOrderId: string,
  photoUrl: string,
  photoType: 'before' | 'after'
) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'İş emri bulunamadı' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Sadece atanan kullanıcı veya admin fotoğraf yükleyebilir
  if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('work_order_photos')
    .insert({
      work_order_id: workOrderId,
      photo_url: photoUrl,
      photo_type: photoType,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/modules/is-emri/${workOrderId}`)
  return { data }
}

export async function addWorkOrderSignature(
  workOrderId: string,
  signerType: 'employee' | 'customer',
  signatureData: string
) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'İş emri bulunamadı' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Çalışan imzası: sadece atanan kullanıcı veya admin
  // Müşteri imzası: herkes (cihazda yapılacak)
  if (signerType === 'employee') {
    if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
      return { error: 'Yetkiniz bulunmamaktadır' }
    }
  }

  const { data, error } = await supabase
    .from('work_order_signatures')
    .insert({
      work_order_id: workOrderId,
      signer_type: signerType,
      signature_data: signatureData,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/modules/is-emri/${workOrderId}`)
  return { data }
}


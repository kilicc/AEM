'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { WorkOrderStatus } from '@/lib/types'
import { sendWorkOrderNotification } from '@/lib/notifications/whatsapp'
import { sendWorkOrderEmailNotification } from '@/lib/notifications/email'

export async function createWorkOrder(data: {
  customer_id: string
  service_id: string
  assigned_user_id: string
  notes?: string
}) {
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

  const { data: workOrder, error } = await supabase
    .from('work_orders')
    .insert({
      ...data,
      status: 'waiting',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Send WhatsApp and email notifications to assigned user
  try {
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

    if (assignedUser) {
      const message = `Yeni iş emri oluşturuldu!\n\nMüşteri: ${customer?.name || 'Bilinmiyor'}\nAdres: ${customer?.address || 'Bilinmiyor'}\n\nDetaylar için sisteme giriş yapın.`
      
      if (assignedUser.phone) {
        await sendWorkOrderNotification(
          workOrder.id,
          data.assigned_user_id,
          assignedUser.phone,
          message
        )
      }

      if (assignedUser.email) {
        await sendWorkOrderEmailNotification(
          workOrder.id,
          data.assigned_user_id,
          assignedUser.email,
          'Yeni İş Emri Oluşturuldu',
          message
        )
      }
    }
  } catch (notificationError) {
    console.error('Notification error:', notificationError)
    // Don't fail the work order creation if notification fails
  }

  revalidatePath('/modules/is-emri')
  return { data: workOrder }
}

export async function getWorkOrders(userId?: string) {
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

  let query = supabase
    .from('work_orders')
    .select('*, customers(*), services(*), users!work_orders_assigned_user_id_fkey(name, email)')

  if (profile?.role !== 'admin') {
    // Users see only their assigned work orders
    query = query.eq('assigned_user_id', user.id)
  } else if (userId) {
    // Admin can filter by user
    query = query.eq('assigned_user_id', userId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getWorkOrder(workOrderId: string) {
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
    return { error: 'Unauthorized' }
  }

  return { data: workOrder }
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  status: WorkOrderStatus,
  location?: { lat: number; lng: number; address?: string }
) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'Work order not found' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Only assigned user or admin can update status
  if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
    return { error: 'Unauthorized' }
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

  // Send notification to admin when status changes
  if (status === 'in-progress' || status === 'completed') {
    try {
      const { data: admins } = await supabase
        .from('users')
        .select('id, phone, email, name')
        .eq('role', 'admin')

      const { data: assignedUser } = await supabase
        .from('users')
        .select('name')
        .eq('id', workOrder.assigned_user_id)
        .single()

      const statusText = status === 'in-progress' ? 'İşlemde' : 'Tamamlandı'
      const message = `İş emri durumu değişti!\n\nİş Emri ID: ${workOrderId}\nÇalışan: ${assignedUser?.name || 'Bilinmiyor'}\nYeni Durum: ${statusText}`

      if (admins) {
        for (const admin of admins) {
          if (admin.phone) {
            await sendWorkOrderNotification(
              workOrderId,
              admin.id,
              admin.phone,
              message
            )
          }
          if (admin.email) {
            await sendWorkOrderEmailNotification(
              workOrderId,
              admin.id,
              admin.email,
              `İş Emri Durumu: ${statusText}`,
              message
            )
          }
        }
      }
    } catch (notificationError) {
      console.error('Admin notification error:', notificationError)
      // Don't fail the status update if notification fails
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
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'Work order not found' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Only assigned user or admin can add materials
  if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
    return { error: 'Unauthorized' }
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

  // Update product quantity in depot
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
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'Work order not found' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Only assigned user or admin can upload photos
  if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
    return { error: 'Unauthorized' }
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
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*')
    .eq('id', workOrderId)
    .single()

  if (!workOrder) {
    return { error: 'Work order not found' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Employee signature: only assigned user or admin
  // Customer signature: anyone (will be done on device)
  if (signerType === 'employee') {
    if (profile?.role !== 'admin' && workOrder.assigned_user_id !== user.id) {
      return { error: 'Unauthorized' }
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


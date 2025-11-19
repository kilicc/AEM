'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { sendNotificationWithLog } from './actions'

// Toplu bildirim gönder
export async function sendBulkNotification(data: {
  notification_type: 'whatsapp' | 'email' | 'sms'
  recipient_type: 'all_users' | 'all_admins' | 'selected_users' | 'custom_group'
  recipient_ids?: string[]
  message: string
  subject?: string
  template_id?: string
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

  // Alıcıları belirle
  let recipients: Array<{ id: string; phone?: string; email?: string }> = []

  if (data.recipient_type === 'all_users') {
    const { data: users } = await supabase
      .from('users')
      .select('id, phone, email')
    recipients = users || []
  } else if (data.recipient_type === 'all_admins') {
    const { data: admins } = await supabase
      .from('users')
      .select('id, phone, email')
      .eq('role', 'admin')
    recipients = admins || []
  } else if (data.recipient_type === 'selected_users' && data.recipient_ids) {
    const { data: users } = await supabase
      .from('users')
      .select('id, phone, email')
      .in('id', data.recipient_ids)
    recipients = users || []
  }

  // Toplu bildirim kaydı oluştur
  const { data: bulkNotification, error: bulkError } = await supabase
    .from('bulk_notifications')
    .insert({
      created_by: user.id,
      notification_type: data.notification_type,
      recipient_type: data.recipient_type,
      recipient_ids: data.recipient_ids || [],
      message: data.message,
      subject: data.subject,
      template_id: data.template_id,
      status: 'sending',
      total_recipients: recipients.length,
    })
    .select()
    .single()

  if (bulkError) {
    return { error: bulkError.message }
  }

  // Bildirimleri gönder
  let sentCount = 0
  let failedCount = 0

  for (const recipient of recipients) {
    const recipientValue = data.notification_type === 'whatsapp' 
      ? recipient.phone 
      : recipient.email

    if (!recipientValue) {
      failedCount++
      continue
    }

    const result = await sendNotificationWithLog(
      recipient.id,
      data.notification_type,
      recipientValue,
      data.message,
      data.subject
    )

    if (result.result?.success) {
      sentCount++
    } else {
      failedCount++
    }
  }

  // Toplu bildirim durumunu güncelle
  await supabase
    .from('bulk_notifications')
    .update({
      status: 'completed',
      sent_count: sentCount,
      failed_count: failedCount,
      completed_at: new Date().toISOString(),
    })
    .eq('id', bulkNotification.id)

  revalidatePath('/modules/admin/notifications')

  return { 
    data: bulkNotification, 
    stats: { total: recipients.length, sent: sentCount, failed: failedCount }
  }
}

// Toplu bildirimleri getir
export async function getBulkNotifications(limit = 50) {
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
    .from('bulk_notifications')
    .select('*, created_by:users!bulk_notifications_created_by_fkey(name)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Zamanlanmış bildirim oluştur
export async function createScheduledNotification(notificationData: {
  notification_type: 'whatsapp' | 'email' | 'sms'
  recipient_id?: string
  recipient_phone?: string
  recipient_email?: string
  message: string
  subject?: string
  scheduled_at: string
  template_id?: string
  recurrence_pattern?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
    end_date?: string
  }
}) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('scheduled_notifications')
    .insert({
      created_by: user.id,
      ...notificationData,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/admin/notifications')

  return { data }
}

// Zamanlanmış bildirimleri getir
export async function getScheduledNotifications(status?: string) {
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
    .from('scheduled_notifications')
    .select('*, created_by:users!scheduled_notifications_created_by_fkey(name), recipient_id:users!scheduled_notifications_recipient_id_fkey(name)')
    .order('scheduled_at', { ascending: true })

  if (profile?.role !== 'admin') {
    query = query.or(`created_by.eq.${user.id},recipient_id.eq.${user.id}`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Zamanlanmış bildirimi iptal et
export async function cancelScheduledNotification(id: string) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { error } = await supabase
    .from('scheduled_notifications')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/admin/notifications')

  return { success: true }
}


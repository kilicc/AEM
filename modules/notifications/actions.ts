'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { sendEmail } from '@/lib/notifications/email'

// Bildirim gönder ve logla
export async function sendNotificationWithLog(
  userId: string,
  type: 'whatsapp' | 'email' | 'sms',
  recipient: string,
  message: string,
  subject?: string,
  metadata?: any
) {
  const supabase = createServerClient()

  // Önce log oluştur (pending)
  const { data: log, error: logError } = await supabase
    .from('notification_logs')
    .insert({
      user_id: userId,
      notification_type: type,
      recipient,
      message,
      status: 'pending',
      metadata,
    })
    .select()
    .single()

  if (logError) {
    return { error: logError.message }
  }

  // Bildirimi gönder
  let result
  if (type === 'whatsapp') {
    result = await sendWhatsAppMessage(recipient, message)
  } else if (type === 'email') {
    result = await sendEmail(recipient, subject || 'Bildirim', message)
  } else {
    // SMS için henüz implement edilmedi
    result = { success: false, error: 'SMS henüz desteklenmiyor' }
  }

  // Log'u güncelle
  await supabase
    .from('notification_logs')
    .update({
      status: result.success ? 'sent' : 'failed',
      error_message: result.error,
    })
    .eq('id', log.id)

  return { data: log, result }
}

// Bildirim loglarını getir
export async function getNotificationLogs(userId?: string, limit = 50) {
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

  let query = supabase
    .from('notification_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', user.id)
  } else if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Bildirim şablonlarını getir
export async function getNotificationTemplates(type?: 'whatsapp' | 'email' | 'sms') {
  const supabase = createServerClient()

  let query = supabase
    .from('notification_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Bildirim şablonu oluştur
export async function createNotificationTemplate(data: {
  name: string
  type: 'whatsapp' | 'email' | 'sms'
  subject?: string
  body: string
  variables?: any
}) {
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

  const { data: template, error } = await supabase
    .from('notification_templates')
    .insert(data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/admin/notifications')
  return { data: template }
}

// Bildirim ayarlarını getir
export async function getNotificationSettings(userId?: string) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const targetUserId = userId || user.id

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && targetUserId !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  // Eğer ayar yoksa varsayılan oluştur
  if (!settings) {
    const { data: newSettings } = await supabase
      .from('notification_settings')
      .insert({
        user_id: targetUserId,
        whatsapp_enabled: true,
        email_enabled: true,
        sms_enabled: true,
        work_order_created: true,
        work_order_status_changed: true,
        low_stock_alert: true,
      })
      .select()
      .single()

    return { data: newSettings }
  }

  return { data: settings }
}

// Bildirim ayarlarını güncelle
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<{
    whatsapp_enabled: boolean
    email_enabled: boolean
    sms_enabled: boolean
    work_order_created: boolean
    work_order_status_changed: boolean
    low_stock_alert: boolean
  }>
) {
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

  if (profile?.role !== 'admin' && userId !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('notification_settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/admin/notifications')
  return { data }
}


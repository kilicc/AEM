'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// Aktif oturumları getir
export async function getActiveSessions() {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('last_activity', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Oturumu sonlandır
export async function terminateSession(sessionId: string) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')

  return { success: true }
}

// Tüm oturumları sonlandır (mevcut hariç)
export async function terminateAllOtherSessions() {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const headersList = headers()
  const currentToken = headersList.get('authorization')?.replace('Bearer ', '')

  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .neq('session_token', currentToken || '')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')

  return { success: true }
}


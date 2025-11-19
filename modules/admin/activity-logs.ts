'use server'

import { createServerClient } from '@/lib/supabase'
import { headers } from 'next/headers'

// Aktivite logu kaydet
export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: any
) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'

  await supabase.from('activity_logs').insert({
    user_id: user?.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

// Aktivite loglarını getir
export async function getActivityLogs(filters?: {
  user_id?: string
  entity_type?: string
  action?: string
  limit?: number
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

  let query = supabase
    .from('activity_logs')
    .select(`
      *,
      user:users(id, name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(filters?.limit || 100)

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id)
  }

  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type)
  }

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}


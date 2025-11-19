'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// IP kısıtlaması ekle
export async function addIPRestriction(userId: string, ipAddress: string, isAllowed: boolean, notes?: string) {
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

  const { data, error } = await supabase
    .from('ip_restrictions')
    .insert({
      user_id: userId,
      ip_address: ipAddress,
      is_allowed: isAllowed,
      notes,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/admin/security')

  return { data }
}

// IP kısıtlamalarını getir
export async function getIPRestrictions(userId?: string) {
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
    .from('ip_restrictions')
    .select('*, user:users(id, name, email)')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// IP kısıtlamasını kontrol et
export async function checkIPRestriction(userId: string) {
  const supabase = createServerClient()

  const headersList = headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  // Kullanıcı için IP kısıtlamalarını kontrol et
  const { data: restrictions } = await supabase
    .from('ip_restrictions')
    .select('is_allowed')
    .eq('user_id', userId)
    .eq('ip_address', ipAddress)

  if (restrictions && restrictions.length > 0) {
    // En son kısıtlama geçerli
    const lastRestriction = restrictions[restrictions.length - 1]
    return { allowed: lastRestriction.is_allowed }
  }

  // Kısıtlama yoksa izin ver
  return { allowed: true }
}


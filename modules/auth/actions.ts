'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function signIn(email: string, password: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message || 'Giriş yapılırken bir hata oluştu' }
  }

  if (data.session) {
    // Session cookie'lerini set et
    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/',
    })
    cookieStore.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/',
    })
  }

  // Profil kontrolü
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Kullanıcı profili bulunamadı. Lütfen yöneticinizle iletişime geçin.' }
  }

  revalidatePath('/')
  return { data, profile }
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  
  // Cookie'leri temizle
  const cookieStore = await cookies()
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
  
  revalidatePath('/')
}

export async function getCurrentUser() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Get user profile from public.users table
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return null
  }

  return {
    ...user,
    ...profile,
  }
}


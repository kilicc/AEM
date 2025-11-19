'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function signIn(email: string, password: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}

export async function getCurrentUser() {
  const supabase = createServerClient()
  
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


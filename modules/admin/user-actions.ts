'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Service role client for admin operations
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase yapılandırması eksik')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createUser(data: {
  email: string
  password: string
  name: string
  phone?: string
  role: 'admin' | 'user'
}) {
  const supabase = getServiceClient()

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError) {
      return { error: authError.message }
    }

    // 2. Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        role: data.role,
      })
      .select()
      .single()

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { error: profileError.message }
    }

    revalidatePath('/modules/admin/users')
    return { data: profile }
  } catch (error: any) {
    return { error: error.message || 'Kullanıcı oluşturulurken bir hata oluştu' }
  }
}

export async function updateUser(userId: string, data: {
  name?: string
  phone?: string
  role?: 'admin' | 'user'
}) {
  const supabase = getServiceClient()

  const { data: profile, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/admin/users')
  return { data: profile }
}

export async function deleteUser(userId: string) {
  const supabase = getServiceClient()

  try {
    // Delete auth user (this will cascade delete profile due to RLS)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      return { error: authError.message }
    }

    revalidatePath('/modules/admin/users')
    return { data: { success: true } }
  } catch (error: any) {
    return { error: error.message || 'Kullanıcı silinirken bir hata oluştu' }
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const supabase = getServiceClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { data: { success: true } }
}


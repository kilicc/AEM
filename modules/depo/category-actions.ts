'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Kategori oluştur
export async function createProductCategory(name: string, description?: string) {
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
    .from('product_categories')
    .insert({ name, description })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')

  return { data }
}

// Kategorileri getir
export async function getProductCategories() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Kategoriyi güncelle
export async function updateProductCategory(id: string, name: string, description?: string) {
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
    .from('product_categories')
    .update({ name, description })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')

  return { data }
}

// Kategoriyi sil
export async function deleteProductCategory(id: string) {
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

  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')

  return { success: true }
}


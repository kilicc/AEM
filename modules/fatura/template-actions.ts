'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Fatura şablonu oluştur
export async function createInvoiceTemplate(name: string, templateData: any, isDefault = false) {
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

  // Eğer varsayılan olarak işaretleniyorsa, diğerlerini false yap
  if (isDefault) {
    await supabase
      .from('invoice_templates')
      .update({ is_default: false })
      .eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('invoice_templates')
    .insert({ name, template_data: templateData, is_default: isDefault })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/fatura')

  return { data }
}

// Fatura şablonlarını getir
export async function getInvoiceTemplates() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Varsayılan şablonu getir
export async function getDefaultInvoiceTemplate() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('invoice_templates')
    .select('*')
    .eq('is_default', true)
    .single()

  if (error) {
    // Varsayılan yoksa ilk şablonu döndür
    const { data: firstTemplate } = await supabase
      .from('invoice_templates')
      .select('*')
      .limit(1)
      .single()

    return { data: firstTemplate }
  }

  return { data }
}


'use server'

import { createServerClient } from '@/lib/supabase'
import { exampleServiceTemplates } from './example-services'

/**
 * Örnek teknik servis formlarını veritabanına yükler
 * Bu fonksiyon sadece admin tarafından çalıştırılmalı
 */
export async function seedExampleServices() {
  // Environment variable kontrolü
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: 'Supabase yapılandırması eksik' }
  }

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
    return { error: 'Sadece admin bu işlemi yapabilir' }
  }

  // Mevcut servisleri kontrol et
  const { data: existingServices } = await supabase
    .from('services')
    .select('name')

  const existingNames = existingServices?.map(s => s.name) || []

  // Sadece yeni olanları ekle
  const servicesToInsert = exampleServiceTemplates.filter(
    template => !existingNames.includes(template.name)
  )

  if (servicesToInsert.length === 0) {
    return { 
      success: true, 
      message: 'Tüm örnek servisler zaten mevcut',
      count: 0 
    }
  }

  const servicesData = servicesToInsert.map(template => ({
    name: template.name,
    description: template.description,
    form_template: template.form_template,
  }))

  const { data, error } = await supabase
    .from('services')
    .insert(servicesData)
    .select()

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: `${servicesToInsert.length} adet örnek servis başarıyla eklendi`,
    count: servicesToInsert.length,
    data
  }
}


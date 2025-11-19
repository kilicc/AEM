'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { createWorkOrder } from './actions'

// İş emri şablonu oluştur
export async function createWorkOrderTemplate(data: {
  name: string
  description?: string
  customer_id?: string
  service_id: string
  default_notes?: string
  is_recurring?: boolean
  recurrence_pattern?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
  }
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
    .from('work_order_templates')
    .insert(data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/is-emri/templates')
  return { data: template }
}

// İş emri şablonlarını getir
export async function getWorkOrderTemplates() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('work_order_templates')
    .select('*, customers(*), services(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Şablondan iş emri oluştur
export async function createWorkOrderFromTemplate(
  templateId: string,
  assignedUserId: string,
  overrideData?: {
    customer_id?: string
    service_id?: string
    notes?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  }
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

  if (profile?.role !== 'admin') {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  // Şablonu getir
  const { data: template, error: templateError } = await supabase
    .from('work_order_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (templateError || !template) {
    return { error: 'Şablon bulunamadı' }
  }

  // İş emri oluştur
  const workOrderData = {
    customer_id: overrideData?.customer_id || template.customer_id || '',
    service_id: overrideData?.service_id || template.service_id,
    assigned_user_id: assignedUserId,
    notes: overrideData?.notes || template.default_notes,
    priority: overrideData?.priority || 'normal',
  }

  if (!workOrderData.customer_id) {
    return { error: 'Müşteri seçilmelidir' }
  }

  const result = await createWorkOrder(workOrderData)

  return result
}


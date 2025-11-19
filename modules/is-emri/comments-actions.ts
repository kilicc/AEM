'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// İş emri yorumu ekle
export async function addWorkOrderComment(workOrderId: string, comment: string) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('work_order_comments')
    .insert({
      work_order_id: workOrderId,
      user_id: user.id,
      comment,
    })
    .select(`
      *,
      user:users(id, name, email)
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Geçmişe ekle
  await supabase
    .from('work_order_history')
    .insert({
      work_order_id: workOrderId,
      changed_by: user.id,
      change_type: 'comment_added',
      new_value: { comment },
      description: 'Yorum eklendi',
    })

  revalidatePath(`/modules/is-emri/${workOrderId}`)

  return { data }
}

// İş emri yorumlarını getir
export async function getWorkOrderComments(workOrderId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('work_order_comments')
    .select(`
      *,
      user:users(id, name, email)
    `)
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// İş emri geçmişini getir
export async function getWorkOrderHistory(workOrderId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('work_order_history')
    .select(`
      *,
      changed_by:users(id, name, email)
    `)
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}


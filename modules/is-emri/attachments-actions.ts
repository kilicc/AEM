'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// İş emri ekle
export async function addWorkOrderAttachment(
  workOrderId: string,
  fileName: string,
  fileUrl: string,
  fileType?: string,
  fileSize?: number
) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('work_order_attachments')
    .insert({
      work_order_id: workOrderId,
      file_name: fileName,
      file_url: fileUrl,
      file_type: fileType,
      file_size: fileSize,
      uploaded_by: user.id,
    })
    .select(`
      *,
      uploaded_by:users(id, name, email)
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
      change_type: 'attachment_added',
      new_value: { file_name: fileName },
      description: 'Dosya eklendi',
    })

  revalidatePath(`/modules/is-emri/${workOrderId}`)

  return { data }
}

// İş emri eklerini getir
export async function getWorkOrderAttachments(workOrderId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('work_order_attachments')
    .select(`
      *,
      uploaded_by:users(id, name, email)
    `)
    .eq('work_order_id', workOrderId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// İş emri ekini sil
export async function deleteWorkOrderAttachment(attachmentId: string) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { error } = await supabase
    .from('work_order_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/is-emri')

  return { success: true }
}


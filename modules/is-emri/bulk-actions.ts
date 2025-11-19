'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { sendNotificationWithLog } from '@/modules/notifications/actions'

// Toplu iş emri oluştur
export async function createBulkWorkOrders(workOrders: Array<{
  customer_id: string
  service_id: string
  assigned_user_id: string
  notes?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}>) {
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

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    created: [] as any[],
  }

  for (const woData of workOrders) {
    try {
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .insert({
          ...woData,
          status: 'waiting',
          priority: woData.priority || 'normal',
        })
        .select()
        .single()

      if (error) {
        results.failed++
        results.errors.push(`İş emri oluşturulamadı: ${error.message}`)
        continue
      }

      results.success++
      results.created.push(workOrder)

      // Atanan kullanıcıya bildirim gönder
      const { data: assignedUser } = await supabase
        .from('users')
        .select('phone, email, name')
        .eq('id', woData.assigned_user_id)
        .single()

      if (assignedUser) {
        const message = `Yeni iş emri atandı. Müşteri: ${woData.customer_id}, Hizmet: ${woData.service_id}`

        if (assignedUser.phone) {
          await sendNotificationWithLog(
            woData.assigned_user_id,
            'whatsapp',
            assignedUser.phone,
            message
          )
        }

        if (assignedUser.email) {
          await sendNotificationWithLog(
            woData.assigned_user_id,
            'email',
            assignedUser.email,
            message,
            'Yeni İş Emri'
          )
        }
      }
    } catch (err: any) {
      results.failed++
      results.errors.push(`Hata: ${err.message}`)
    }
  }

  revalidatePath('/modules/is-emri')

  return { data: results }
}


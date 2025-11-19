'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { createInvoiceFromWorkOrder } from './actions'

// Toplu fatura oluştur
export async function createBulkInvoices(workOrderIds: string[]) {
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

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    created: [] as any[],
  }

  for (const workOrderId of workOrderIds) {
    try {
      const result = await createInvoiceFromWorkOrder(workOrderId)

      if (result.error) {
        results.failed++
        results.errors.push(`İş emri ${workOrderId}: ${result.error}`)
      } else {
        results.success++
        if (result.data) {
          results.created.push(result.data)
        }
      }
    } catch (err: any) {
      results.failed++
      results.errors.push(`İş emri ${workOrderId}: ${err.message}`)
    }
  }

  revalidatePath('/modules/fatura')

  return { data: results }
}


'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Fatura ödemesi ekle
export async function addInvoicePayment(data: {
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other'
  reference_number?: string
  notes?: string
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

  // Faturayı getir
  const { data: invoice } = await supabase
    .from('invoices')
    .select('total_amount, status')
    .eq('id', data.invoice_id)
    .single()

  if (!invoice) {
    return { error: 'Fatura bulunamadı' }
  }

  // Ödeme kaydı oluştur
  const { data: payment, error: paymentError } = await supabase
    .from('invoice_payments')
    .insert(data)
    .select()
    .single()

  if (paymentError) {
    return { error: paymentError.message }
  }

  // Toplam ödemeleri hesapla
  const { data: payments } = await supabase
    .from('invoice_payments')
    .select('amount')
    .eq('invoice_id', data.invoice_id)

  const totalPaid = payments?.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0

  // Fatura durumunu güncelle
  let newStatus = invoice.status
  if (totalPaid >= Number(invoice.total_amount)) {
    newStatus = 'paid'
  } else if (totalPaid > 0) {
    newStatus = 'sent' // Kısmi ödeme
  }

  await supabase
    .from('invoices')
    .update({ status: newStatus })
    .eq('id', data.invoice_id)

  revalidatePath(`/modules/fatura/${data.invoice_id}`)

  return { data: payment }
}

// Fatura ödemelerini getir
export async function getInvoicePayments(invoiceId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('invoice_payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('payment_date', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Toplam ödenen tutarı hesapla
  const totalPaid = data?.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0

  return { data, totalPaid }
}


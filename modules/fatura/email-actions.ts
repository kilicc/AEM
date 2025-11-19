'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/notifications/email'

// Faturayı e-posta ile gönder
export async function sendInvoiceByEmail(invoiceId: string, recipientEmail: string) {
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
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      customers(id, name, email),
      work_orders(id)
    `)
    .eq('id', invoiceId)
    .single()

  if (invoiceError || !invoice) {
    return { error: 'Fatura bulunamadı' }
  }

  // E-posta gönder
  const subject = `Fatura: ${invoice.invoice_number}`
  const body = `
Sayın ${invoice.customers?.name || 'Müşteri'},

${invoice.invoice_number} numaralı faturanız ekte gönderilmiştir.

Toplam Tutar: ${invoice.total_amount} TL
Vade Tarihi: ${invoice.due_date || 'Belirtilmemiş'}

Sorularınız için bizimle iletişime geçebilirsiniz.

Saygılarımızla,
AEM Sistemi
  `.trim()

  const emailResult = await sendEmail(recipientEmail, subject, body)

  // E-posta logunu kaydet
  await supabase
    .from('invoice_email_logs')
    .insert({
      invoice_id: invoiceId,
      sent_to: recipientEmail,
      status: emailResult.success ? 'sent' : 'failed',
      error_message: emailResult.error,
    })

  // Fatura durumunu güncelle
  if (emailResult.success) {
    await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', invoiceId)
  }

  revalidatePath(`/modules/fatura/${invoiceId}`)

  return { success: emailResult.success, error: emailResult.error }
}

// Fatura e-posta geçmişini getir
export async function getInvoiceEmailLogs(invoiceId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('invoice_email_logs')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('sent_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}


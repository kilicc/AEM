'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { InvoiceStatus } from '@/lib/types'

export async function createInvoiceFromWorkOrder(workOrderId: string) {
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

  // İş emrini tüm ilişkili verilerle al
  const { data: workOrder, error: workOrderError } = await supabase
    .from('work_orders')
    .select(`
      *,
      customers(*),
      work_order_materials(*, products(*))
    `)
    .eq('id', workOrderId)
    .single()

  if (workOrderError || !workOrder) {
    return { error: 'İş emri bulunamadı' }
  }

  if (workOrder.status !== 'completed') {
    return { error: 'Fatura oluşturmak için iş emri tamamlanmış olmalıdır' }
  }

  // Fatura zaten var mı kontrol et
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('work_order_id', workOrderId)
    .single()

  if (existingInvoice) {
    return { error: 'Bu iş emri için zaten bir fatura mevcut' }
  }

  // Toplamları hesapla
  let subtotal = 0
  const items = workOrder.work_order_materials || []

  items.forEach((item: any) => {
    subtotal += Number(item.quantity) * Number(item.unit_price)
  })

  const taxRate = 0.20 // %20 KDV
  const taxAmount = subtotal * taxRate
  const totalAmount = subtotal + taxAmount

  // Fatura numarası oluştur
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  // Fatura oluştur
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      work_order_id: workOrderId,
      customer_id: workOrder.customer_id,
      invoice_number: invoiceNumber,
      status: 'draft',
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      issue_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (invoiceError) {
    return { error: invoiceError.message }
  }

  // Fatura kalemlerini oluştur
  const invoiceItems = items.map((item: any) => ({
    invoice_id: invoice.id,
    product_name: item.products?.name || 'Unknown',
    quantity: item.quantity,
    unit: item.products?.unit || 'adet',
    unit_price: item.unit_price,
    total: Number(item.quantity) * Number(item.unit_price),
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems)

  if (itemsError) {
    return { error: itemsError.message }
  }

  revalidatePath('/modules/fatura')
  return { data: invoice }
}

export async function getInvoices() {
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
    .from('invoices')
    .select('*, customers(*), work_orders(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getInvoice(invoiceId: string) {
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
    .from('invoices')
    .select('*, customers(*), work_orders(*), invoice_items(*)')
    .eq('id', invoiceId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
) {
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
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/fatura')
  return { data }
}


import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const supabase = createServerClient()
  const searchTerm = `%${query}%`

  const results: any[] = []

  // İş emirlerinde ara
  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('id, notes, customers(name), services(name)')
    .or(`notes.ilike.${searchTerm},customers.name.ilike.${searchTerm},services.name.ilike.${searchTerm}`)
    .limit(5)

  if (workOrders) {
    workOrders.forEach((wo: any) => {
      results.push({
        type: 'work_order',
        id: wo.id,
        title: wo.customers?.name || 'İş Emri',
        subtitle: wo.services?.name,
        url: `/modules/is-emri/${wo.id}`,
      })
    })
  }

  // Müşterilerde ara
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone')
    .or(`name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
    .limit(5)

  if (customers) {
    customers.forEach((customer: any) => {
      results.push({
        type: 'customer',
        id: customer.id,
        title: customer.name,
        subtitle: customer.phone,
        url: `/modules/musteri/${customer.id}`,
      })
    })
  }

  // Faturalarda ara
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, customers(name)')
    .or(`invoice_number.ilike.${searchTerm},customers.name.ilike.${searchTerm}`)
    .limit(5)

  if (invoices) {
    invoices.forEach((invoice: any) => {
      results.push({
        type: 'invoice',
        id: invoice.id,
        title: `Fatura ${invoice.invoice_number}`,
        subtitle: invoice.customers?.name,
        url: `/modules/fatura/${invoice.id}`,
      })
    })
  }

  // Ürünlerde ara
  const { data: products } = await supabase
    .from('products')
    .select('id, name, depots(name)')
    .ilike('name', searchTerm)
    .limit(5)

  if (products) {
    products.forEach((product: any) => {
      results.push({
        type: 'product',
        id: product.id,
        title: product.name,
        subtitle: product.depots?.name,
        url: `/modules/depo?product=${product.id}`,
      })
    })
  }

  return NextResponse.json({ results: results.slice(0, 10) })
}


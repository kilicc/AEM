import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Stok uyarılarını getir
    const { data: alerts, error } = await supabase
      .from('stock_alerts')
      .select(`
        *,
        product:products(id, name, unit),
        depot:depots(id, name)
      `)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format data
    const formattedAlerts = alerts?.map((alert: any) => ({
      id: alert.id,
      product_name: alert.product?.name || 'Bilinmeyen Ürün',
      depot_name: alert.depot?.name || 'Bilinmeyen Depo',
      current_quantity: alert.current_quantity,
      threshold: alert.threshold,
      unit: alert.product?.unit || 'adet',
      created_at: alert.created_at,
    })) || []

    return NextResponse.json({ alerts: formattedAlerts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


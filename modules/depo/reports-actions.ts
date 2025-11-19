'use server'

import { createServerClient } from '@/lib/supabase'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

// Depo raporları - En çok kullanılan malzemeler
export async function getDepotReports(depotId?: string, period: 'day' | 'week' | 'month' = 'month') {
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

  const now = new Date()
  let startDate: Date
  let endDate: Date = now

  switch (period) {
    case 'day':
      startDate = startOfDay(now)
      endDate = endOfDay(now)
      break
    case 'week':
      startDate = startOfWeek(now)
      endDate = endOfWeek(now)
      break
    case 'month':
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break
  }

  // İş emirlerinde kullanılan malzemeleri getir
  let materialsQuery = supabase
    .from('work_order_materials')
    .select(`
      quantity,
      unit_price,
      products(id, name, unit, depot_id, depots(name)),
      work_orders!inner(created_at, status)
    `)
    .gte('work_orders.created_at', startDate.toISOString())
    .lte('work_orders.created_at', endDate.toISOString())
    .eq('work_orders.status', 'completed')

  if (depotId) {
    materialsQuery = materialsQuery.eq('products.depot_id', depotId)
  }

  const { data: materials } = await materialsQuery

  // Malzeme kullanım istatistikleri
  const materialUsage: Record<string, {
    product_id: string
    name: string
    unit: string
    depot_name: string
    totalQuantity: number
    totalValue: number
    usageCount: number
  }> = {}

  materials?.forEach((mat: any) => {
    const product = mat.products
    if (!product) return

    const productId = product.id
    if (!materialUsage[productId]) {
      materialUsage[productId] = {
        product_id: productId,
        name: product.name || 'Bilinmeyen',
        unit: product.unit || 'adet',
        depot_name: product.depots?.name || 'Bilinmeyen Depo',
        totalQuantity: 0,
        totalValue: 0,
        usageCount: 0,
      }
    }

    materialUsage[productId].totalQuantity += Number(mat.quantity || 0)
    materialUsage[productId].totalValue += Number(mat.quantity || 0) * Number(mat.unit_price || 0)
    materialUsage[productId].usageCount += 1
  })

  // En çok kullanılan malzemeleri sırala
  const mostUsedMaterials = Object.values(materialUsage)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 20)

  // En değerli malzemeleri sırala
  const mostValuableMaterials = Object.values(materialUsage)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 20)

  // Depo bazında toplam kullanım
  const depotUsage: Record<string, {
    depot_name: string
    totalQuantity: number
    totalValue: number
    productCount: number
  }> = {}

  Object.values(materialUsage).forEach((mat) => {
    if (!depotUsage[mat.depot_name]) {
      depotUsage[mat.depot_name] = {
        depot_name: mat.depot_name,
        totalQuantity: 0,
        totalValue: 0,
        productCount: 0,
      }
    }
    depotUsage[mat.depot_name].totalQuantity += mat.totalQuantity
    depotUsage[mat.depot_name].totalValue += mat.totalValue
    depotUsage[mat.depot_name].productCount += 1
  })

  return {
    data: {
      mostUsedMaterials,
      mostValuableMaterials,
      depotUsage: Object.values(depotUsage),
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  }
}

// Depo stok raporu
export async function getDepotStockReport(depotId?: string) {
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

  let query = supabase
    .from('products')
    .select('*, depots(name), product_categories(name)')
    .order('quantity', { ascending: true })

  if (depotId) {
    query = query.eq('depot_id', depotId)
  }

  const { data: products } = await query

  // Düşük stoklu ürünler
  const lowStockProducts = products?.filter((p: any) => {
    // Stok uyarıları ile karşılaştır
    return Number(p.quantity) <= 10 // Varsayılan eşik
  }) || []

  // Kategori bazında stok
  const categoryStock: Record<string, {
    category_name: string
    totalQuantity: number
    totalValue: number
    productCount: number
  }> = {}

  products?.forEach((p: any) => {
    const categoryName = p.product_categories?.name || 'Kategori Yok'
    if (!categoryStock[categoryName]) {
      categoryStock[categoryName] = {
        category_name: categoryName,
        totalQuantity: 0,
        totalValue: 0,
        productCount: 0,
      }
    }
    categoryStock[categoryName].totalQuantity += Number(p.quantity || 0)
    categoryStock[categoryName].totalValue += Number(p.quantity || 0) * Number(p.unit_price || 0)
    categoryStock[categoryName].productCount += 1
  })

  return {
    data: {
      totalProducts: products?.length || 0,
      lowStockProducts,
      categoryStock: Object.values(categoryStock),
      totalStockValue: products?.reduce((sum: number, p: any) => 
        sum + (Number(p.quantity || 0) * Number(p.unit_price || 0)), 0) || 0,
    },
  }
}


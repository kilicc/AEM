'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { Customer, CustomerDevice } from '@/lib/types'

export async function createCustomer(data: {
  name: string
  email?: string
  phone: string
  address: string
  city?: string
  district?: string
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

  const { data: customer, error } = await supabase
    .from('customers')
    .insert(data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/musteri')
  return { data: customer }
}

export async function getCustomers() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getCustomer(customerId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*, customer_devices(*)')
    .eq('id', customerId)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function updateCustomer(
  customerId: string,
  data: Partial<Customer>
) {
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

  const { data: customer, error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', customerId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/musteri')
  return { data: customer }
}

export async function addCustomerDevice(
  customerId: string,
  deviceData: {
    device_type: string
    brand?: string
    model?: string
    serial_number?: string
    notes?: string
  }
) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('customer_devices')
    .insert({
      customer_id: customerId,
      ...deviceData,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/modules/musteri/${customerId}`)
  return { data }
}


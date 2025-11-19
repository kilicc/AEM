// User types
export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  created_at: string
  updated_at: string
}

// Depot types
export type UnitType = 'adet' | 'metre' | 'kilogram' | 'litre' | 'metrekare' | 'metrekup'

export interface Depot {
  id: string
  name: string
  address?: string
  admin_id: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  depot_id: string
  name: string
  unit: UnitType
  unit_price: number
  quantity: number
  type: 'product' | 'tool' // product: malzeme, tool: araç/gereç
  created_at: string
  updated_at: string
}

export interface ToolAssignment {
  id: string
  tool_id: string
  user_id: string
  assigned_at: string
  returned_at?: string
  is_returned: boolean
}

// Customer types
export interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  address: string
  city?: string
  district?: string
  created_at: string
  updated_at: string
}

export interface CustomerDevice {
  id: string
  customer_id: string
  device_type: string
  brand?: string
  model?: string
  serial_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Service types
export interface Service {
  id: string
  name: string
  description?: string
  form_template?: string // JSON string for form fields
  created_at: string
  updated_at: string
}

// Work Order types
export type WorkOrderStatus = 'waiting' | 'in-progress' | 'completed' | 'cancelled'

export interface WorkOrder {
  id: string
  customer_id: string
  service_id: string
  assigned_user_id: string
  status: WorkOrderStatus
  location_lat?: number
  location_lng?: number
  location_address?: string
  started_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface WorkOrderMaterial {
  id: string
  work_order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
}

export interface WorkOrderPhoto {
  id: string
  work_order_id: string
  photo_url: string
  photo_type: 'before' | 'after'
  uploaded_at: string
}

export interface WorkOrderSignature {
  id: string
  work_order_id: string
  signer_type: 'employee' | 'customer'
  signature_data: string // Base64 encoded signature
  signed_at: string
}

// Invoice types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled'

export interface Invoice {
  id: string
  work_order_id: string
  customer_id: string
  invoice_number: string
  status: InvoiceStatus
  total_amount: number
  tax_amount: number
  subtotal: number
  issue_date: string
  due_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_name: string
  quantity: number
  unit: UnitType
  unit_price: number
  total: number
}


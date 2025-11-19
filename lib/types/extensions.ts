// Extended types for new features

export interface NotificationLog {
  id: string
  user_id: string
  notification_type: 'whatsapp' | 'email' | 'sms'
  recipient: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
  metadata?: any
  created_at: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: 'whatsapp' | 'email' | 'sms'
  subject?: string
  body: string
  variables?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  id: string
  user_id: string
  whatsapp_enabled: boolean
  email_enabled: boolean
  sms_enabled: boolean
  work_order_created: boolean
  work_order_status_changed: boolean
  low_stock_alert: boolean
  created_at: string
  updated_at: string
}

export interface StockAlert {
  id: string
  product_id: string
  threshold_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkOrderTemplate {
  id: string
  name: string
  description?: string
  customer_id?: string
  service_id: string
  default_notes?: string
  is_recurring: boolean
  recurrence_pattern?: {
    type: 'daily' | 'weekly' | 'monthly'
    interval: number
  }
  created_at: string
  updated_at: string
}

export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface WorkOrderComment {
  id: string
  work_order_id: string
  user_id: string
  comment: string
  created_at: string
  updated_at: string
}

export interface WorkOrderAttachment {
  id: string
  work_order_id: string
  file_name: string
  file_url: string
  file_type?: string
  file_size?: number
  uploaded_by?: string
  created_at: string
}

export interface WorkOrderHistory {
  id: string
  work_order_id: string
  changed_by?: string
  change_type: string
  old_value?: any
  new_value?: any
  description?: string
  created_at: string
}

export interface CustomerCommunication {
  id: string
  customer_id: string
  communication_type: 'call' | 'email' | 'whatsapp' | 'sms' | 'meeting'
  subject?: string
  content: string
  user_id?: string
  created_at: string
}

export interface CustomerRating {
  id: string
  customer_id: string
  work_order_id?: string
  rating: number
  comment?: string
  created_at: string
}

export interface InvoicePayment {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other'
  reference_number?: string
  notes?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}


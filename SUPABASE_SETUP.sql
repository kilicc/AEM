-- ============================================
-- AEM - SUPABASE VERİTABANI KURULUM DOSYASI
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de SIRAYLA çalıştırın
-- Tüm kodlar bu dosyada birleştirilmiştir
-- ============================================

-- 1. UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. ANA TABLOLAR (schema.sql)
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Depots table
CREATE TABLE IF NOT EXISTS public.depots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (malzeme ve araç/gereç)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  depot_id UUID NOT NULL REFERENCES public.depots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('adet', 'metre', 'kilogram', 'litre', 'metrekare', 'metrekup')),
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('product', 'tool')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tool assignments (zimmet sistemi)
CREATE TABLE IF NOT EXISTS public.tool_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  returned_at TIMESTAMP WITH TIME ZONE,
  is_returned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer devices table
CREATE TABLE IF NOT EXISTS public.customer_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  form_template JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work orders table
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  assigned_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled')) DEFAULT 'waiting',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work order materials table
CREATE TABLE IF NOT EXISTS public.work_order_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work order photos table
CREATE TABLE IF NOT EXISTS public.work_order_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work order signatures table
CREATE TABLE IF NOT EXISTS public.work_order_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  signer_type TEXT NOT NULL CHECK (signer_type IN ('employee', 'customer')),
  signature_data TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')) DEFAULT 'draft',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. GENİŞLETMELER - PART 1 (schema-extensions.sql)
-- ============================================

-- Bildirim geçmişi tablosu
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('whatsapp', 'email', 'sms')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bildirim şablonları tablosu
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bildirim ayarları tablosu
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT TRUE,
  work_order_created BOOLEAN DEFAULT TRUE,
  work_order_status_changed BOOLEAN DEFAULT TRUE,
  low_stock_alert BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stok uyarıları tablosu
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  threshold_quantity DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İş emri şablonları tablosu
CREATE TABLE IF NOT EXISTS public.work_order_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  default_notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İş emri öncelik alanı ekle
ALTER TABLE public.work_orders 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal';

-- İş emri yorumları tablosu
CREATE TABLE IF NOT EXISTS public.work_order_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İş emri ekleri tablosu
CREATE TABLE IF NOT EXISTS public.work_order_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İş emri geçmişi tablosu
CREATE TABLE IF NOT EXISTS public.work_order_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müşteri iletişim geçmişi tablosu
CREATE TABLE IF NOT EXISTS public.customer_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('call', 'email', 'whatsapp', 'sms', 'meeting')),
  subject TEXT,
  content TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müşteri değerlendirmeleri tablosu
CREATE TABLE IF NOT EXISTS public.customer_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fatura ödeme takibi tablosu
CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check', 'other')),
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktivite logları tablosu
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. GENİŞLETMELER - PART 2 (schema-extensions-2.sql)
-- ============================================

-- Depo transferleri tablosu
CREATE TABLE IF NOT EXISTS public.depot_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  from_depot_id UUID NOT NULL REFERENCES public.depots(id) ON DELETE CASCADE,
  to_depot_id UUID NOT NULL REFERENCES public.depots(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  transferred_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ürün kategorileri tablosu
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ürünlere kategori ekle
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL;

-- Ürünlere barkod/QR kod ekle
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Toplu bildirimler tablosu
CREATE TABLE IF NOT EXISTS public.bulk_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('whatsapp', 'email', 'sms')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all_users', 'all_admins', 'selected_users', 'custom_group')),
  recipient_ids JSONB,
  message TEXT NOT NULL,
  subject TEXT,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sending', 'completed', 'failed')) DEFAULT 'pending',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Zamanlanmış bildirimler tablosu
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('whatsapp', 'email', 'sms')),
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_phone TEXT,
  recipient_email TEXT,
  message TEXT NOT NULL,
  subject TEXT,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')) DEFAULT 'pending',
  recurrence_pattern JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müşteri grupları tablosu
CREATE TABLE IF NOT EXISTS public.customer_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Müşteri-grup ilişkisi
CREATE TABLE IF NOT EXISTS public.customer_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.customer_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, group_id)
);

-- Müşteri özel günleri tablosu
CREATE TABLE IF NOT EXISTS public.customer_special_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  day_type TEXT NOT NULL CHECK (day_type IN ('birthday', 'anniversary', 'custom')),
  day_date DATE NOT NULL,
  description TEXT,
  reminder_days_before INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fatura şablonları tablosu
CREATE TABLE IF NOT EXISTS public.invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fatura e-posta gönderim geçmişi
CREATE TABLE IF NOT EXISTS public.invoice_email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  sent_to TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT
);

-- Oturum yönetimi tablosu
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IP kısıtlamaları tablosu
CREATE TABLE IF NOT EXISTS public.ip_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  is_allowed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İki faktörlü kimlik doğrulama tablosu
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  secret_key TEXT NOT NULL,
  backup_codes TEXT[],
  is_enabled BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp onaylı şablonlar tablosu
CREATE TABLE IF NOT EXISTS public.whatsapp_approved_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL UNIQUE,
  category TEXT,
  language TEXT DEFAULT 'tr',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  variables JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 5. INDEXES
-- ============================================

-- Ana tablolar için indexler
CREATE INDEX IF NOT EXISTS idx_depots_admin_id ON public.depots(admin_id);
CREATE INDEX IF NOT EXISTS idx_products_depot_id ON public.products(depot_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_tool_assignments_user_id ON public.tool_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_assignments_tool_id ON public.tool_assignments(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_assignments_is_returned ON public.tool_assignments(is_returned);
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_user_id ON public.work_orders(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_id ON public.work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_work_order_id ON public.invoices(work_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Extension tabloları için indexler
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON public.stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_work_order_comments_work_order_id ON public.work_order_comments(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_history_work_order_id ON public.work_order_history(work_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id ON public.customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Extension 2 tabloları için indexler
CREATE INDEX IF NOT EXISTS idx_depot_transfers_product_id ON public.depot_transfers(product_id);
CREATE INDEX IF NOT EXISTS idx_depot_transfers_from_depot ON public.depot_transfers(from_depot_id);
CREATE INDEX IF NOT EXISTS idx_depot_transfers_to_depot ON public.depot_transfers(to_depot_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_bulk_notifications_created_by ON public.bulk_notifications(created_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_at ON public.scheduled_notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON public.scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_customer_group_members_customer ON public.customer_group_members(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_group_members_group ON public.customer_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_customer_special_days_customer ON public.customer_special_days(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_special_days_date ON public.customer_special_days(day_date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_ip_restrictions_user_id ON public.ip_restrictions(user_id);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) ENABLE
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depot_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_special_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_approved_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES - ANA TABLOLAR
-- ============================================
-- ÖNCE: Tüm mevcut policy'leri sil (eğer varsa)
-- Bu sayede dosya tekrar çalıştırılabilir (idempotent)

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                       r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Users Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- Depots Policies
DROP POLICY IF EXISTS "Admins can manage depots" ON public.depots;
CREATE POLICY "Admins can manage depots" ON public.depots
  FOR ALL USING (public.is_admin());

-- Products Policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view products" ON public.products;
CREATE POLICY "Users can view products" ON public.products
  FOR SELECT USING (true);

-- Tool Assignments Policies
DROP POLICY IF EXISTS "Users can view own assignments" ON public.tool_assignments;
CREATE POLICY "Users can view own assignments" ON public.tool_assignments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage assignments" ON public.tool_assignments;
CREATE POLICY "Admins can manage assignments" ON public.tool_assignments
  FOR ALL USING (public.is_admin());

-- Customers Policies
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers" ON public.customers
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view customers" ON public.customers;
CREATE POLICY "Users can view customers" ON public.customers
  FOR SELECT USING (true);

-- Work Orders Policies
DROP POLICY IF EXISTS "Users can view assigned work orders" ON public.work_orders;
CREATE POLICY "Users can view assigned work orders" ON public.work_orders
  FOR SELECT USING (
    assigned_user_id = auth.uid() OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can manage work orders" ON public.work_orders;
CREATE POLICY "Admins can manage work orders" ON public.work_orders
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own work orders" ON public.work_orders;
CREATE POLICY "Users can update own work orders" ON public.work_orders
  FOR UPDATE USING (assigned_user_id = auth.uid());

-- Invoices Policies
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL USING (public.is_admin());

-- ============================================
-- 8. RLS POLICIES - EXTENSION TABLOLAR
-- ============================================

-- Notification Logs
DROP POLICY IF EXISTS "Users can view own notification logs" ON public.notification_logs;
CREATE POLICY "Users can view own notification logs" ON public.notification_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all notification logs" ON public.notification_logs;
CREATE POLICY "Admins can view all notification logs" ON public.notification_logs
  FOR SELECT USING (public.is_admin());

-- Notification Templates
DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
  FOR ALL USING (public.is_admin());

-- Notification Settings
DROP POLICY IF EXISTS "Users can manage own notification settings" ON public.notification_settings;
CREATE POLICY "Users can manage own notification settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- Stock Alerts
DROP POLICY IF EXISTS "Admins can manage stock alerts" ON public.stock_alerts;
CREATE POLICY "Admins can manage stock alerts" ON public.stock_alerts
  FOR ALL USING (public.is_admin());

-- Work Order Templates
DROP POLICY IF EXISTS "Admins can manage work order templates" ON public.work_order_templates;
CREATE POLICY "Admins can manage work order templates" ON public.work_order_templates
  FOR ALL USING (public.is_admin());

-- Work Order Comments
DROP POLICY IF EXISTS "Users can view work order comments" ON public.work_order_comments;
CREATE POLICY "Users can view work order comments" ON public.work_order_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create work order comments" ON public.work_order_comments;
CREATE POLICY "Users can create work order comments" ON public.work_order_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Work Order History
DROP POLICY IF EXISTS "Users can view work order history" ON public.work_order_history;
CREATE POLICY "Users can view work order history" ON public.work_order_history
  FOR SELECT USING (true);

-- Activity Logs
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin());

-- ============================================
-- 9. RLS POLICIES - EXTENSION 2 TABLOLAR
-- ============================================

-- Depot Transfers
DROP POLICY IF EXISTS "Admins can manage depot transfers" ON public.depot_transfers;
CREATE POLICY "Admins can manage depot transfers" ON public.depot_transfers
  FOR ALL USING (public.is_admin());

-- Product Categories
DROP POLICY IF EXISTS "Admins can manage product categories" ON public.product_categories;
CREATE POLICY "Admins can manage product categories" ON public.product_categories
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view product categories" ON public.product_categories;
CREATE POLICY "Users can view product categories" ON public.product_categories
  FOR SELECT USING (true);

-- Bulk Notifications
DROP POLICY IF EXISTS "Admins can manage bulk notifications" ON public.bulk_notifications;
CREATE POLICY "Admins can manage bulk notifications" ON public.bulk_notifications
  FOR ALL USING (public.is_admin());

-- Scheduled Notifications
DROP POLICY IF EXISTS "Users can manage own scheduled notifications" ON public.scheduled_notifications;
CREATE POLICY "Users can manage own scheduled notifications" ON public.scheduled_notifications
  FOR ALL USING (auth.uid() = created_by OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Admins can view all scheduled notifications" ON public.scheduled_notifications;
CREATE POLICY "Admins can view all scheduled notifications" ON public.scheduled_notifications
  FOR SELECT USING (public.is_admin());

-- Customer Groups
DROP POLICY IF EXISTS "Admins can manage customer groups" ON public.customer_groups;
CREATE POLICY "Admins can manage customer groups" ON public.customer_groups
  FOR ALL USING (public.is_admin());

-- Customer Special Days
DROP POLICY IF EXISTS "Admins can manage customer special days" ON public.customer_special_days;
CREATE POLICY "Admins can manage customer special days" ON public.customer_special_days
  FOR ALL USING (public.is_admin());

-- Invoice Templates
DROP POLICY IF EXISTS "Admins can manage invoice templates" ON public.invoice_templates;
CREATE POLICY "Admins can manage invoice templates" ON public.invoice_templates
  FOR ALL USING (public.is_admin());

-- User Sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (public.is_admin());

-- IP Restrictions
DROP POLICY IF EXISTS "Admins can manage IP restrictions" ON public.ip_restrictions;
CREATE POLICY "Admins can manage IP restrictions" ON public.ip_restrictions
  FOR ALL USING (public.is_admin());

-- User 2FA
DROP POLICY IF EXISTS "Users can manage own 2FA" ON public.user_2fa;
CREATE POLICY "Users can manage own 2FA" ON public.user_2fa
  FOR ALL USING (auth.uid() = user_id);

-- WhatsApp Templates
DROP POLICY IF EXISTS "Admins can manage WhatsApp templates" ON public.whatsapp_approved_templates;
CREATE POLICY "Admins can manage WhatsApp templates" ON public.whatsapp_approved_templates
  FOR ALL USING (public.is_admin());

-- ============================================
-- 10. FUNCTIONS
-- ============================================

-- Helper function to check if user is admin (bypasses RLS to avoid infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 11. TRIGGERS
-- ============================================

-- Ana tablolar için triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_depots_updated_at BEFORE UPDATE ON public.depots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Extension tabloları için triggers
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_alerts_updated_at BEFORE UPDATE ON public.stock_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_order_templates_updated_at BEFORE UPDATE ON public.work_order_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_order_comments_updated_at BEFORE UPDATE ON public.work_order_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Extension 2 tabloları için triggers
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON public.invoice_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_2fa_updated_at BEFORE UPDATE ON public.user_2fa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- KURULUM TAMAMLANDI!
-- ============================================
-- Şimdi Prisma ile tipleri oluşturun:
-- npx prisma db pull
-- npx prisma generate
-- ============================================


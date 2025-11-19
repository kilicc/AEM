-- AEM Database Schema Extensions - Part 2
-- Eksik özellikler için ek tablolar

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
  recipient_ids JSONB, -- Seçili kullanıcı ID'leri
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
  recurrence_pattern JSONB, -- {type: 'daily'|'weekly'|'monthly', interval: number, end_date: date}
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
  template_data JSONB NOT NULL, -- PDF template configuration
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
  backup_codes TEXT[], -- Backup kodlar
  is_enabled BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp onaylı şablonlar tablosu
CREATE TABLE IF NOT EXISTS public.whatsapp_approved_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL UNIQUE, -- WhatsApp template ID
  category TEXT,
  language TEXT DEFAULT 'tr',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  variables JSONB, -- Template değişkenleri
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
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

-- RLS Policies
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

-- RLS Policies: Depot Transfers
CREATE POLICY "Admins can manage depot transfers" ON public.depot_transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: Product Categories
CREATE POLICY "Admins can manage product categories" ON public.product_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view product categories" ON public.product_categories
  FOR SELECT USING (true);

-- RLS Policies: Bulk Notifications
CREATE POLICY "Admins can manage bulk notifications" ON public.bulk_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: Scheduled Notifications
CREATE POLICY "Users can manage own scheduled notifications" ON public.scheduled_notifications
  FOR ALL USING (auth.uid() = created_by OR auth.uid() = recipient_id);

CREATE POLICY "Admins can view all scheduled notifications" ON public.scheduled_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: Customer Groups
CREATE POLICY "Admins can manage customer groups" ON public.customer_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: Customer Special Days
CREATE POLICY "Admins can manage customer special days" ON public.customer_special_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: Invoice Templates
CREATE POLICY "Admins can manage invoice templates" ON public.invoice_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: User Sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: IP Restrictions
CREATE POLICY "Admins can manage IP restrictions" ON public.ip_restrictions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies: User 2FA
CREATE POLICY "Users can manage own 2FA" ON public.user_2fa
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies: WhatsApp Templates
CREATE POLICY "Admins can manage WhatsApp templates" ON public.whatsapp_approved_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON public.invoice_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_2fa_updated_at BEFORE UPDATE ON public.user_2fa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


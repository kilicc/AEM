# AEM - Saha İş Takip ve Depo Yönetim Sistemi

Next.js, TypeScript, TailwindCSS, Supabase ve Prisma kullanılarak geliştirilmiş saha iş takip ve depo/envanter yönetim sistemi.

## Teknolojiler

- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Database ve Auth)
- **Prisma** (Sadece db pull ve type generation için)

## Özellikler

### Kullanıcı Tipleri
- **Admin**: Tüm sistem yönetimi
- **User (Çalışan)**: İş emirlerini görüntüleme ve güncelleme

### Modüller

#### 1. Depo/Envanter Modülü
- Çoklu depo oluşturma
- Ürün/Malzeme girişi (birim: adet, metre, kilogram, litre, metrekare, metrekup)
- Birim fiyat yönetimi
- Araç/Gereç yönetimi
- Zimmet sistemi (araç/gereçlerin çalışanlara atanması ve geri alınması)

#### 2. Müşteri Modülü
- Müşteri kayıt ve yönetimi
- Müşteri cihaz bilgileri takibi

#### 3. İş Emri Modülü
- İş emri oluşturma (müşteri, hizmet seçimi)
- Teknik servis formu (otomatik taslak)
- Müşteri bilgilerinin otomatik doldurulması
- Kullanılan malzeme/ürün seçimi
- Öncesi/sonrası fotoğraf yükleme
- Dijital imza (çalışan ve müşteri)
- Durum takibi (beklemede, işlemde, tamamlandı)
- Konum takibi (işlemde durumuna geçildiğinde)

#### 4. Fatura Modülü
- Tamamlanan iş emirlerinden otomatik fatura taslağı oluşturma
- Proforma fatura
- Fatura durumu takibi (taslak, gönderildi, ödendi, iptal)

#### 5. Bildirim Sistemi
- WhatsApp bildirimleri (yeni iş emri, durum değişiklikleri)
- Email bildirimleri
- Admin'e durum değişiklik bildirimleri

## Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Environment Variables
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_database_url

# WhatsApp API (opsiyonel)
WHATSAPP_API_URL=
WHATSAPP_API_KEY=

# Email (opsiyonel)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### 3. Supabase Database Setup
1. Supabase projenizde SQL Editor'ü açın
2. `lib/db/schema.sql` dosyasındaki SQL'i çalıştırın
3. Row Level Security (RLS) politikaları otomatik oluşturulacak

### 4. Prisma Type Generation
```bash
npx prisma db pull
npx prisma generate
```

### 5. Development Server
```bash
npm run dev
```

## Proje Yapısı

```
/app                 # Next.js App Router pages
/modules             # Feature modules
  /admin            # Admin modülü
  /auth             # Authentication
  /depo             # Depo/Envanter
  /fatura           # Fatura
  /is-emri          # İş Emri
  /musteri           # Müşteri
/components         # React components
/lib                # Utilities
  /db              # Database schema
  /location        # Geolocation utilities
  /notifications   # WhatsApp/Email
  /types           # TypeScript types
  /utils           # Helper functions
```

## Database Schema

Supabase, database'in tek kaynağıdır. Schema değişiklikleri için:
1. Supabase'de değişiklikleri yapın
2. `npx prisma db pull` çalıştırın
3. `npx prisma generate` çalıştırın

## Build ve Deploy

```bash
npm run build
```

Build başarılı olduktan sonra otomatik olarak GitHub'a push edilir:
```bash
git push origin main
```

## Notlar

- Tüm backend logic Next.js Server Actions içinde
- Supabase JS client runtime'da kullanılır
- Prisma sadece type generation için kullanılır
- Row Level Security (RLS) aktif
- Responsive ve mobile-first tasarım

## Lisans

Proprietary


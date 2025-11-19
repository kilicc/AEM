# AEM - Saha İş Takip ve Depo Yönetim Sistemi

Next.js, TypeScript, TailwindCSS, Supabase ve Prisma kullanılarak geliştirilmiş saha iş takip ve depo/envanter yönetim sistemi.

## Teknolojiler

- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (Veritabanı ve Kimlik Doğrulama)
- **Prisma** (Sadece veritabanı şeması çekme ve tip oluşturma için)

## Özellikler

### Kullanıcı Tipleri
- **Admin**: Tüm sistem yönetimi
- **Kullanıcı (Çalışan)**: İş emirlerini görüntüleme ve güncelleme

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
- E-posta bildirimleri
- Admin'e durum değişiklik bildirimleri

## Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Ortam Değişkenleri
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=supabase_proje_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_anon_key
DATABASE_URL=supabase_veritabani_url

# WhatsApp API (isteğe bağlı)
WHATSAPP_API_URL=
WHATSAPP_API_KEY=

# E-posta (isteğe bağlı)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### 3. Supabase Veritabanı Kurulumu
1. Supabase projenizde SQL Editor'ü açın
2. `lib/db/schema.sql` dosyasındaki SQL'i çalıştırın
3. Satır Seviyesi Güvenlik (RLS) politikaları otomatik oluşturulacak

### 4. Prisma Tip Oluşturma
```bash
npx prisma db pull
npx prisma generate
```

### 5. Geliştirme Sunucusu
```bash
npm run dev
```

## Proje Yapısı

```
/app                 # Next.js App Router sayfaları
/modules             # Özellik modülleri
  /admin            # Admin modülü
  /auth             # Kimlik doğrulama
  /depo             # Depo/Envanter
  /fatura           # Fatura
  /is-emri          # İş Emri
  /musteri          # Müşteri
/components         # React bileşenleri
/lib                # Yardımcı fonksiyonlar
  /db              # Veritabanı şeması
  /location        # Konum yardımcı fonksiyonları
  /notifications   # WhatsApp/E-posta
  /types           # TypeScript tipleri
  /utils           # Yardımcı fonksiyonlar
```

## Veritabanı Şeması

Supabase, veritabanının tek kaynağıdır. Şema değişiklikleri için:
1. Supabase'de değişiklikleri yapın
2. `npx prisma db pull` çalıştırın
3. `npx prisma generate` çalıştırın

## Derleme ve Yayınlama

```bash
npm run build
```

Derleme başarılı olduktan sonra otomatik olarak GitHub'a gönderilir:
```bash
git push origin main
```

## Notlar

- Tüm backend mantığı Next.js Server Actions içinde
- Supabase JS client çalışma zamanında kullanılır
- Prisma sadece tip oluşturma için kullanılır
- Satır Seviyesi Güvenlik (RLS) aktif
- Duyarlı ve mobil-öncelikli tasarım

## Lisans

Özel

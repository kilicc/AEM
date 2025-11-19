# Supabase Kurulum Rehberi

Bu rehber, AEM sistemini Supabase'de kurmak için gereken tüm adımları içerir.

## 📋 Adım Adım Kurulum

### 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabınıza giriş yapın
2. Yeni proje oluşturun
3. Proje URL ve API Key'lerini not edin

### 2. SQL Editor'de SQL Çalıştırma

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. **New Query** butonuna tıklayın
3. `SUPABASE_SETUP.sql` dosyasının **TAMAMINI** kopyalayıp yapıştırın
4. **Run** butonuna tıklayın
5. Başarılı mesajını bekleyin (tüm tablolar, indexler, RLS politikaları oluşturulacak)

### 3. Environment Variables (.env.local)

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# WhatsApp API (İsteğe bağlı - şimdilik boş bırakabilirsiniz)
WHATSAPP_API_URL=
WHATSAPP_API_KEY=

# E-posta SMTP (İsteğe bağlı - şimdilik boş bırakabilirsiniz)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Google Maps (İsteğe bağlı)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

**Önemli:** 
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` Supabase Dashboard > Settings > API'den alınır
- `DATABASE_URL` Supabase Dashboard > Settings > Database > Connection string'den alınır (şifreyi değiştirmeyi unutmayın)

### 4. Prisma Type Generation

Terminal'de şu komutları çalıştırın:

```bash
# Veritabanı şemasını çek
npx prisma db pull

# TypeScript tiplerini oluştur
npx prisma generate
```

### 5. İlk Admin Kullanıcı Oluşturma

Supabase Dashboard'da:

1. **Authentication** > **Users** sekmesine gidin
2. **Add user** > **Create new user** seçin
3. Email ve şifre girin
4. Kullanıcı oluşturulduktan sonra, **SQL Editor**'de şu sorguyu çalıştırın:

```sql
-- Kullanıcı ID'sini auth.users tablosundan alın ve buraya yazın
INSERT INTO public.users (id, email, name, role)
VALUES (
  'KULLANICI_ID_BURAYA',  -- auth.users tablosundaki user ID
  'admin@example.com',    -- Email
  'Admin Kullanıcı',      -- İsim
  'admin'                 -- Role
);
```

**Alternatif:** Supabase Dashboard > Authentication > Users'dan kullanıcı ID'sini kopyalayın ve yukarıdaki sorguda kullanın.

### 6. Örnek Servis Şablonlarını Yükleme (İsteğe bağlı)

Sistemde örnek teknik servis formları yüklemek için:

1. Uygulamayı çalıştırın: `npm run dev`
2. Admin olarak giriş yapın
3. `/modules/admin` sayfasına gidin
4. "Örnek Servisleri Yükle" butonuna tıklayın (eğer varsa)

Veya doğrudan `lib/seed/seed-services.ts` dosyasındaki `seedExampleServices()` fonksiyonunu çağırabilirsiniz.

### 7. Storage Bucket Oluşturma (Fotoğraflar için)

1. Supabase Dashboard > **Storage** sekmesine gidin
2. **New bucket** oluşturun:
   - Name: `work-order-photos`
   - Public: ✅ (işaretli)
   - File size limit: 10MB (veya istediğiniz değer)
   - Allowed MIME types: `image/*`

3. **Policies** sekmesinde şu policy'yi ekleyin:

```sql
-- Herkes fotoğraf yükleyebilir (authenticated users)
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'work-order-photos');

-- Herkes fotoğrafları görüntüleyebilir
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'work-order-photos');
```

### 8. Test

1. Uygulamayı başlatın: `npm run dev`
2. Tarayıcıda `http://localhost:3000` adresine gidin
3. Admin kullanıcısı ile giriş yapın
4. Dashboard'u kontrol edin

## ✅ Kontrol Listesi

- [ ] Supabase projesi oluşturuldu
- [ ] `SUPABASE_SETUP.sql` dosyası çalıştırıldı (tüm tablolar oluşturuldu)
- [ ] `.env.local` dosyası oluşturuldu ve dolduruldu
- [ ] `npx prisma db pull` çalıştırıldı
- [ ] `npx prisma generate` çalıştırıldı
- [ ] İlk admin kullanıcı oluşturuldu
- [ ] Storage bucket oluşturuldu (work-order-photos)
- [ ] Uygulama çalışıyor ve giriş yapılabiliyor

## 🔧 Sorun Giderme

### "Supabase yapılandırması eksik" hatası
- `.env.local` dosyasının doğru yerde olduğundan emin olun
- Environment variable'ların doğru olduğunu kontrol edin
- Uygulamayı yeniden başlatın

### "Permission denied" hatası
- RLS politikalarının doğru çalıştığını kontrol edin
- Kullanıcının `public.users` tablosunda kaydı olduğundan emin olun
- Kullanıcının `role` alanının `admin` olduğunu kontrol edin

### Tablolar görünmüyor
- SQL Editor'de `SELECT * FROM public.users;` sorgusunu çalıştırın
- Tabloların oluşturulduğunu doğrulayın
- RLS'nin aktif olduğunu kontrol edin

## 📝 Notlar

- Tüm veritabanı şeması `SUPABASE_SETUP.sql` dosyasında birleştirilmiştir
- Bu dosyayı tek seferde çalıştırabilirsiniz
- `IF NOT EXISTS` kullanıldığı için güvenle tekrar çalıştırabilirsiniz
- RLS (Row Level Security) tüm tablolarda aktif

## 🚀 Sonraki Adımlar

1. WhatsApp API entegrasyonu (isteğe bağlı)
2. E-posta SMTP yapılandırması (isteğe bağlı)
3. Google Maps API key ekleme (isteğe bağlı)
4. Örnek veriler ekleme (depo, müşteri, ürün)


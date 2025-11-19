# İlk Admin Kullanıcısı Oluşturma Rehberi

## 🎯 Amaç

Sistemin ilk admin kullanıcısını oluşturmak için kullanılır. Bu script, Supabase Auth ve public.users tablosuna admin kullanıcısı ekler.

## 📋 Gereksinimler

1. Supabase projesi kurulu olmalı
2. `SUPABASE_SETUP.sql` dosyası Supabase'de çalıştırılmış olmalı
3. `.env` dosyasında şu değişkenler tanımlı olmalı:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Kullanım

```bash
npm run create:admin
```

## 📝 Adımlar

1. Script çalıştırıldığında sizden şu bilgiler istenir:
   - **E-posta**: Admin kullanıcının e-posta adresi
   - **Şifre**: En az 6 karakter
   - **Ad Soyad**: Kullanıcının tam adı
   - **Telefon**: Opsiyonel

2. Script otomatik olarak:
   - Supabase Auth'a kullanıcı ekler
   - `public.users` tablosuna admin profili ekler
   - E-posta doğrulamasını atlar (email_confirm: true)

3. Başarılı olursa:
   - Kullanıcı bilgileri gösterilir
   - Bu bilgilerle giriş yapabilirsiniz

## ⚠️ Önemli Notlar

- **Service Role Key** kullanılır: Bu script, admin yetkileri için `SUPABASE_SERVICE_ROLE_KEY` kullanır
- **E-posta doğrulaması atlanır**: İlk admin kullanıcısı için e-posta doğrulaması otomatik olarak yapılır
- **Güvenlik**: Service Role Key'i **ASLA** client-side'da kullanmayın, sadece server-side scriptlerde kullanın

## 🔒 Güvenlik

- Service Role Key, Supabase Dashboard > Settings > API > service_role key'den alınır
- Bu key, RLS (Row Level Security) politikalarını bypass eder
- Sadece güvenilir server-side scriptlerde kullanılmalıdır

## 📞 Sorun Giderme

### "Environment variables eksik" hatası
- `.env` dosyasını kontrol edin
- `NEXT_PUBLIC_SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` tanımlı olmalı

### "Auth kullanıcısı oluşturma hatası"
- E-posta adresi zaten kullanılıyor olabilir
- Şifre en az 6 karakter olmalı
- Supabase projesi aktif olmalı

### "Profil oluşturma hatası"
- `public.users` tablosu oluşturulmuş olmalı
- `SUPABASE_SETUP.sql` dosyası çalıştırılmış olmalı
- RLS politikaları doğru yapılandırılmış olmalı

## ✅ Başarı Kontrolü

Script başarılı olduktan sonra:

1. Supabase Dashboard > Authentication > Users
   - Yeni kullanıcıyı görebilmelisiniz

2. Supabase Dashboard > Table Editor > users
   - Admin profili görünmelidir

3. Uygulamada giriş yapın:
   - `http://localhost:3000/auth/login`
   - Oluşturduğunuz e-posta ve şifre ile giriş yapın

## 🎉 Sonraki Adımlar

Admin kullanıcısı oluşturulduktan sonra:

1. Uygulamaya giriş yapın
2. Dashboard'dan sistem özelliklerini kullanmaya başlayın
3. İlk depoyu oluşturun
4. İlk müşteriyi ekleyin
5. İlk iş emrini oluşturun


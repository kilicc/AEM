# Environment Variables Kurulum Rehberi

## 📋 Adımlar

### 1. .env.local Dosyası Oluşturma

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
cp .env.example .env.local
```

### 2. Supabase Bilgilerini Alma

1. [Supabase Dashboard](https://app.supabase.com) giriş yapın
2. Projenizi seçin
3. **Settings** > **API** sekmesine gidin
4. Şu bilgileri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Database URL Alma

1. Supabase Dashboard'da **Settings** > **Database** sekmesine gidin
2. **Connection string** bölümüne gidin
3. **URI** formatını seçin
4. Şifreyi değiştirmeyi unutmayın: `[YOUR-PASSWORD]` kısmını gerçek şifrenizle değiştirin
5. Kopyalayıp `DATABASE_URL` olarak `.env.local` dosyasına yapıştırın

### 4. .env.local Dosyası Örneği

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://postgres:your-actual-password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 5. Test Etme

Environment variables'ları ayarladıktan sonra:

1. Uygulamayı yeniden başlatın:
   ```bash
   npm run dev
   ```

2. Test sayfasına gidin:
   ```
   http://localhost:3000/test-supabase
   ```

3. "Server-Side Bağlantıyı Test Et" butonuna tıklayın

## ⚠️ Önemli Notlar

- `.env.local` dosyası **ASLA** git'e commit edilmemelidir (zaten .gitignore'da)
- `.env.example` dosyası örnek olarak commit edilir (gerçek değerler olmadan)
- Environment variables değişikliklerinden sonra uygulamayı **yeniden başlatmanız** gerekir
- Supabase yeni API anahtarları kullanıyorsa, Dashboard'dan yeni anahtarları alın

## 🔍 Supabase Yeni API Anahtarları

Eğer Supabase yeni API anahtarları sistemine geçtiyse:

1. Dashboard > **Settings** > **API**'ye gidin
2. **API Keys** bölümünde yeni anahtarları görürsünüz
3. **anon public** key'i kullanın (client-side için)
4. **service_role** key'i **ASLA** client-side'da kullanmayın (sadece server-side, gerekirse)

## ✅ Kontrol Listesi

- [ ] `.env.local` dosyası oluşturuldu
- [ ] `NEXT_PUBLIC_SUPABASE_URL` dolduruldu
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` dolduruldu
- [ ] `DATABASE_URL` dolduruldu (şifre değiştirildi)
- [ ] Uygulama yeniden başlatıldı
- [ ] Test sayfasında bağlantı başarılı


# Database Bağlantı Sorunu Çözüm Rehberi

## 🔴 Mevcut Hata
```
getaddrinfo ENOTFOUND db.zlztpgmxjjtqjxqgihui.supabase.co
```

Bu hata, Supabase database hostname'inin DNS'te çözümlenemediği anlamına gelir.

## 🔍 Olası Nedenler ve Çözümler

### 1. Supabase Projesi Henüz Tam Aktif Değil

**Kontrol:**
- Supabase Dashboard'da projenizin durumunu kontrol edin
- Proje "Active" durumunda olmalı
- Eğer "Paused" veya "Inactive" ise, projeyi aktifleştirin

**Çözüm:**
- Supabase Dashboard > Settings > General
- Proje durumunu kontrol edin
- Gerekirse projeyi yeniden başlatın

### 2. Connection Pooling Kullanılması Gerekiyor

Supabase'in bazı projelerinde **direct connection** yerine **connection pooling** kullanılması gerekir.

**Kontrol:**
1. Supabase Dashboard > Settings > Database
2. **Connection string** bölümüne gidin
3. **Connection pooling** sekmesine bakın
4. Eğer pooling endpoint varsa, onu kullanın

**Connection Pooling Formatı:**
```
postgresql://postgres:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

veya

```
postgresql://postgres:[YOUR-PASSWORD]@db.zlztpgmxjjtqjxqgihui.supabase.co:6543/postgres
```

**Not:** Port `5432` yerine `6543` olabilir (pooling port)

### 3. Connection String Formatı

Supabase Dashboard'dan aldığınız connection string'i **tam olarak** kopyalayın:

1. **Settings** > **Database** > **Connection string**
2. **URI** formatını seçin
3. **Tam string'i kopyalayın** (şifre dahil)
4. `.env` dosyasına yapıştırın

### 4. SSL Sertifikası Sorunu

Bazı durumlarda SSL sertifikası sorunu olabilir. Prisma schema'ya SSL ayarı ekleyin:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL")
}
```

### 5. Supabase Proje URL'i Kontrolü

JWT token'daki `ref` değeri ile connection string'deki hostname eşleşmeli:

- JWT ref: `zlztpgmxjjtqjxqgihui`
- Hostname: `db.zlztpgmxjjtqjxqgihui.supabase.co` ✅

Eğer eşleşmiyorsa, Supabase Dashboard'dan doğru connection string'i alın.

## ✅ Adım Adım Çözüm

1. **Supabase Dashboard'a gidin**
2. **Settings** > **Database** > **Connection string**
3. **URI** formatını seçin
4. **Connection pooling** sekmesine bakın
5. Eğer pooling endpoint varsa, onu kullanın
6. Connection string'i **tam olarak** kopyalayın
7. `.env` dosyasındaki `DATABASE_URL`'i güncelleyin
8. Test edin:
   ```bash
   npm run test:database
   ```

## 🔄 Alternatif: Supabase Client Kullanımı

Eğer direct connection çalışmıyorsa, Prisma yerine Supabase client kullanabilirsiniz (zaten kullanıyorsunuz). Prisma sadece type generation için kullanılıyor, runtime'da Supabase client kullanılıyor.

**Not:** Prisma `db pull` başarısız olsa bile, Supabase client ile uygulama çalışabilir. Sadece TypeScript tipleri manuel olarak oluşturulması gerekebilir.

## 📞 Destek

Eğer sorun devam ederse:
1. Supabase Dashboard'dan connection string'i tekrar kontrol edin
2. Supabase support'a başvurun
3. Proje durumunu kontrol edin


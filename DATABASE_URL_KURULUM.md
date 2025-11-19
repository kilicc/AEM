# DATABASE_URL Kurulum Rehberi

## 🔧 Supabase'den Connection String Alma

### Adımlar:

1. **Supabase Dashboard'a gidin**: https://app.supabase.com
2. **Projenizi seçin**
3. **Settings** > **Database** sekmesine gidin
4. **Connection string** bölümüne gidin
5. **URI** formatını seçin
6. **Connection string'i kopyalayın** - şu formatta olacak:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.zlztpgmxjjtqjxqgihui.supabase.co:5432/postgres
   ```

### ⚠️ ÖNEMLİ: Şifreyi Değiştirin!

Connection string'de `[YOUR-PASSWORD]` kısmını **Supabase projenizin gerçek şifresi** ile değiştirin.

Şifrenizi bilmiyorsanız:
1. Supabase Dashboard > **Settings** > **Database**
2. **Database password** bölümünde şifrenizi görebilir veya reset edebilirsiniz

### .env Dosyasına Ekleme

`.env` dosyanızı açın ve `DATABASE_URL` satırını güncelleyin:

```env
# ÖNCE (YANLIŞ):
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.zlztpgmxjjtqjxqgihui.supabase.co:5432/postgres

# SONRA (DOĞRU - gerçek şifrenizle):
DATABASE_URL=postgresql://postgres:gerçek-şifreniz-buraya@db.zlztpgmxjjtqjxqgihui.supabase.co:5432/postgres
```

### Test Etme

Şifreyi ekledikten sonra:

```bash
npx prisma db pull
npx prisma generate
```

Bu komutlar başarılı olmalı!

## 🔍 Hata Mesajları

### "Can't reach database server"
- Şifre yanlış veya eksik
- Connection string formatı yanlış
- Supabase projesi aktif değil

### "You don't have any models defined"
- Bu normal! Prisma sadece `db pull` için kullanılıyor
- `db pull` başarılı olduktan sonra modeller otomatik oluşacak


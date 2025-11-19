// İlk admin kullanıcısı oluşturma scripti
require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

async function createAdminUser() {
  console.log('🔧 İlk Admin Kullanıcısı Oluşturma\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables eksik!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
    process.exit(1)
  }

  // Service role key ile client oluştur (admin yetkileri için)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Kullanıcı bilgilerini al
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const question = (query) => new Promise((resolve) => rl.question(query, resolve))

  try {
    console.log('📝 Admin kullanıcı bilgilerini girin:\n')

    const email = await question('E-posta: ')
    const password = await question('Şifre (min 6 karakter): ')
    const name = await question('Ad Soyad: ')
    const phone = await question('Telefon (opsiyonel): ')

    if (!email || !password || !name) {
      console.error('❌ E-posta, şifre ve ad soyad zorunludur!')
      rl.close()
      process.exit(1)
    }

    if (password.length < 6) {
      console.error('❌ Şifre en az 6 karakter olmalıdır!')
      rl.close()
      process.exit(1)
    }

    console.log('\n📡 Kullanıcı oluşturuluyor...\n')

    // 1. Auth.users tablosuna kullanıcı ekle
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // E-posta doğrulamasını atla
    })

    if (authError) {
      console.error('❌ Auth kullanıcısı oluşturma hatası:', authError.message)
      rl.close()
      process.exit(1)
    }

    console.log('✅ Auth kullanıcısı oluşturuldu:', authUser.user.id)

    // 2. public.users tablosuna profil ekle
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        name,
        phone: phone || null,
        role: 'admin',
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profil oluşturma hatası:', profileError.message)
      
      // Auth kullanıcısını sil (temizlik)
      await supabase.auth.admin.deleteUser(authUser.user.id)
      console.error('⚠️  Auth kullanıcısı silindi (temizlik)')
      
      rl.close()
      process.exit(1)
    }

    console.log('✅ Profil oluşturuldu')
    console.log('\n🎉 Admin kullanıcısı başarıyla oluşturuldu!\n')
    console.log('📋 Kullanıcı Bilgileri:')
    console.log('   ID:', profile.id)
    console.log('   E-posta:', profile.email)
    console.log('   Ad Soyad:', profile.name)
    console.log('   Telefon:', profile.phone || 'Belirtilmemiş')
    console.log('   Rol:', profile.role)
    console.log('\n✅ Artık bu bilgilerle giriş yapabilirsiniz!')

    rl.close()
  } catch (error) {
    console.error('❌ Beklenmeyen hata:', error.message)
    rl.close()
    process.exit(1)
  }
}

createAdminUser()


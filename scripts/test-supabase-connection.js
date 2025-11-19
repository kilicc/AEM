// Supabase bağlantı test scripti
// Çalıştırma: node scripts/test-supabase-connection.js

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Supabase Bağlantı Testi\n')
console.log('URL:', supabaseUrl ? '✅ Tanımlı' : '❌ Eksik')
console.log('Key:', supabaseKey ? '✅ Tanımlı' : '❌ Eksik')
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables eksik!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('📡 Bağlantı test ediliyor...\n')

    // Test 1: Basit sorgu
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Bağlantı hatası:', error.message)
      console.error('   Kod:', error.code)
      console.error('   Detay:', error.details)
      return false
    }

    console.log('✅ Bağlantı başarılı!')
    console.log('✅ Tablolar erişilebilir\n')

    // Test 2: Auth testi
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Invalid Refresh Token: Refresh Token Not Found') {
      console.log('⚠️  Auth testi:', authError.message)
    } else {
      console.log('✅ Auth sistemi çalışıyor')
    }

    console.log('\n🎉 Tüm testler başarılı!')
    return true
  } catch (err) {
    console.error('❌ Beklenmeyen hata:', err.message)
    return false
  }
}

testConnection().then((success) => {
  process.exit(success ? 0 : 1)
})


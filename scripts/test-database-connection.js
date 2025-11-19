// Database bağlantı testi
require('dotenv').config({ path: '.env' })
const { Client } = require('pg')

async function testDatabaseConnection() {
  console.log('🔍 Database Bağlantı Testi\n')

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable bulunamadı!')
    return
  }

  // URL'i parse et
  const url = new URL(databaseUrl.replace('postgresql://', 'http://'))
  const host = url.hostname
  const port = url.port || 5432
  const database = url.pathname.replace('/', '')
  const username = url.username
  const password = url.password

  console.log(`Host: ${host}`)
  console.log(`Port: ${port}`)
  console.log(`Database: ${database}`)
  console.log(`Username: ${username}`)
  console.log(`Password: ${password ? '✅ Tanımlı (' + password.length + ' karakter)' : '❌ Eksik'}\n`)

  if (!password || password === '[YOUR-PASSWORD]') {
    console.error('❌ Şifre eksik veya placeholder!')
    console.error('   Lütfen .env dosyasında DATABASE_URL içindeki [YOUR-PASSWORD] kısmını gerçek şifrenizle değiştirin.')
    return
  }

  const client = new Client({
    host,
    port,
    database,
    user: username,
    password,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('📡 Bağlantı kuruluyor...\n')
    await client.connect()
    console.log('✅ Bağlantı başarılı!')

    const result = await client.query('SELECT version()')
    console.log('✅ Database versiyonu:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1])

    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      LIMIT 5
    `)
    console.log(`✅ Tablolar erişilebilir (${tableResult.rows.length} tablo bulundu)`)
    if (tableResult.rows.length > 0) {
      console.log('   Örnek tablolar:', tableResult.rows.map(r => r.table_name).join(', '))
    }

    await client.end()
    console.log('\n🎉 Tüm testler başarılı!')
  } catch (error) {
    console.error('❌ Bağlantı hatası:', error.message)
    console.error('\n🔍 Olası sorunlar:')
    console.error('   1. Şifre yanlış olabilir')
    console.error('   2. Supabase projesi henüz aktif olmayabilir')
    console.error('   3. Network/firewall sorunu olabilir')
    console.error('   4. Connection string formatı yanlış olabilir')
    console.error('\n💡 Çözüm:')
    console.error('   - Supabase Dashboard > Settings > Database > Connection string')
    console.error('   - URI formatını seçin ve şifreyi kontrol edin')
  }
}

testDatabaseConnection()


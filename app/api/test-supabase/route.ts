import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Test 1: Bağlantı testi - basit bir sorgu
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bağlantı hatası',
          details: testError.message,
          code: testError.code,
        },
        { status: 500 }
      )
    }

    // Test 2: Auth testi
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Test 3: Tabloları kontrol et
    const tables = [
      'users',
      'depots',
      'products',
      'customers',
      'work_orders',
      'invoices',
    ]

    const tableChecks: Record<string, boolean> = {}
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(0)
      tableChecks[table] = !error
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase bağlantısı başarılı!',
      tests: {
        connection: true,
        auth: !authError,
        tables: tableChecks,
      },
      user: user ? { id: user.id, email: user.email } : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Beklenmeyen hata',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}


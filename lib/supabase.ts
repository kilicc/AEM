import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Client-side client (only create if env vars exist)
let supabase: ReturnType<typeof createClient> | null = null

if (typeof window !== 'undefined') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
}

export { supabase }

// Server-side client for server actions (with cookie support)
export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase yapılandırması eksik. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY gerekli.')
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  // Eğer cookie'lerde token varsa, session'ı set et
  if (accessToken && refreshToken) {
    await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  return client
}


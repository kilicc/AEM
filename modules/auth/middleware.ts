import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth middleware - Kullanıcı yetkilendirme kontrolü

export async function requireAuth(request: NextRequest) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Kullanıcı rolünü al
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return { user, role: profile?.role }
}

export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request)
  
  if (auth instanceof NextResponse) {
    return auth
  }

  if (auth.role !== 'admin') {
    return NextResponse.redirect(new URL('/yetkisiz', request.url))
  }

  return auth
}


import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function requireAuth(request: NextRequest) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Get user role
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
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return auth
}


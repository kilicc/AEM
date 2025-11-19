'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function assignTool(toolId: string, userId: string) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Admin can assign, user can also assign to themselves
  if (profile?.role !== 'admin' && user.id !== userId) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  // Check if tool is available (not already assigned and not returned)
  const { data: existingAssignment } = await supabase
    .from('tool_assignments')
    .select('*')
    .eq('tool_id', toolId)
    .eq('is_returned', false)
    .single()

  if (existingAssignment) {
    return { error: 'Bu araç/gereç zaten zimmetli' }
  }

  const { data, error } = await supabase
    .from('tool_assignments')
    .insert({
      tool_id: toolId,
      user_id: userId,
      is_returned: false,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')
  return { data }
}

export async function returnTool(assignmentId: string) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: assignment } = await supabase
    .from('tool_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single()

  if (!assignment) {
    return { error: 'Zimmet kaydı bulunamadı' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Admin or the assigned user can return
  if (profile?.role !== 'admin' && assignment.user_id !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('tool_assignments')
    .update({
      is_returned: true,
      returned_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/modules/depo')
  return { data }
}

export async function getUserToolAssignments(userId?: string) {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const targetUserId = userId || user.id

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Users can only see their own assignments, admins can see all
  if (profile?.role !== 'admin' && targetUserId !== user.id) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data, error } = await supabase
    .from('tool_assignments')
    .select('*, products(*), users(name, email)')
    .eq('user_id', targetUserId)
    .order('assigned_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}


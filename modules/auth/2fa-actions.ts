'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { authenticator } from 'otplib'

// 2FA secret oluştur
export async function generate2FASecret() {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const secret = authenticator.generateSecret()
  const serviceName = 'AEM Sistemi'
  const accountName = user.email || 'user'

  const otpAuthUrl = authenticator.keyuri(accountName, serviceName, secret)

  // Backup kodlar oluştur
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  )

  return {
    data: {
      secret,
      otpAuthUrl,
      backupCodes,
    },
  }
}

// 2FA'yı etkinleştir
export async function enable2FA(secret: string, token: string) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  // Token'ı doğrula
  const isValid = authenticator.verify({ token, secret })

  if (!isValid) {
    return { error: 'Geçersiz token' }
  }

  // Backup kodlar oluştur
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  )

  // 2FA kaydını oluştur veya güncelle
  const { data, error } = await supabase
    .from('user_2fa')
    .upsert({
      user_id: user.id,
      secret_key: secret,
      backup_codes: backupCodes,
      is_enabled: true,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')

  return { data, backupCodes }
}

// 2FA token'ını doğrula
export async function verify2FAToken(token: string) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { data: user2FA } = await supabase
    .from('user_2fa')
    .select('secret_key, backup_codes')
    .eq('user_id', user.id)
    .eq('is_enabled', true)
    .single()

  if (!user2FA) {
    return { error: '2FA etkin değil' }
  }

  // Token'ı doğrula
  const isValid = authenticator.verify({ token, secret: user2FA.secret_key })

  if (isValid) {
    // Son kullanım zamanını güncelle
    await supabase
      .from('user_2fa')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return { success: true }
  }

  // Backup kod kontrolü
  if (user2FA.backup_codes && user2FA.backup_codes.includes(token)) {
    // Backup kodu kullanıldı, listeden çıkar
    const updatedCodes = user2FA.backup_codes.filter((code: string) => code !== token)
    await supabase
      .from('user_2fa')
      .update({ backup_codes: updatedCodes })
      .eq('user_id', user.id)

    return { success: true }
  }

  return { error: 'Geçersiz token' }
}

// 2FA'yı devre dışı bırak
export async function disable2FA() {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Yetkiniz bulunmamaktadır' }
  }

  const { error } = await supabase
    .from('user_2fa')
    .update({ is_enabled: false })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')

  return { success: true }
}


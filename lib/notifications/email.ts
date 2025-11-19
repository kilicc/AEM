// E-posta bildirim servisi
// Gelecekte SMTP/E-posta servisi ile entegre edilecek

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement email service integration
  // For now, this is a placeholder
  
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.warn('E-posta servisi yapılandırılmamış')
    return { success: false, error: 'E-posta servisi yapılandırılmamış' }
  }

  try {
    // TODO: nodemailer veya benzeri kütüphane kullan
    // Şimdilik sadece logla
    console.log('E-posta gönderilecek:', { to, subject, body })
    
    return { success: true }
  } catch (error) {
    console.error('E-posta bildirim hatası:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
    }
  }
}

export async function sendWorkOrderEmailNotification(
  workOrderId: string,
  userId: string,
  email: string,
  subject: string,
  body: string
) {
  return await sendEmail(email, subject, body)
}


// WhatsApp bildirim servisi
// Gelecekte WhatsApp API ile entegre edilecek

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement WhatsApp API integration
  // For now, this is a placeholder
  
  const whatsappApiUrl = process.env.WHATSAPP_API_URL
  const whatsappApiKey = process.env.WHATSAPP_API_KEY

  if (!whatsappApiUrl || !whatsappApiKey) {
    console.warn('WhatsApp API yapılandırılmamış')
    return { success: false, error: 'WhatsApp API yapılandırılmamış' }
  }

  try {
    // Telefon numarasını formatla (+, boşluk vb. kaldır)
    const formattedPhone = phone.replace(/[^0-9]/g, '')
    
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappApiKey}`,
      },
      body: JSON.stringify({
        to: formattedPhone,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API hatası: ${response.statusText}`)
    }

    return { success: true }
  } catch (error) {
    console.error('WhatsApp bildirim hatası:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
    }
  }
}

export async function sendWorkOrderNotification(
  workOrderId: string,
  userId: string,
  phone: string,
  message: string
) {
  return await sendWhatsAppMessage(phone, message)
}


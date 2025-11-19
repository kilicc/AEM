'use server'

import { getInvoice } from './actions'
import { getCompanyInfo } from '@/lib/company'
import { formatCurrency, formatDate } from '@/lib/utils'

// Fatura PDF oluştur (basit HTML formatında, gerçek PDF için react-pdf veya puppeteer kullanılabilir)
export async function generateInvoicePDF(invoiceId: string): Promise<string> {
  const result = await getInvoice(invoiceId)

  if (result.error || !result.data) {
    throw new Error('Fatura bulunamadı')
  }

  const invoice = result.data
  const company = getCompanyInfo()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fatura - ${invoice.invoice_number}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .company-info {
      flex: 1;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .customer-info {
      margin: 30px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .total-row {
      font-weight: bold;
      background-color: #f9f9f9;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .totals table {
      width: 300px;
      margin-left: auto;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h1>${company.name}</h1>
      <p>${company.address}</p>
      <p>Tel: ${company.phone} | E-posta: ${company.email}</p>
      ${company.taxOffice && company.taxNumber ? `<p>${company.taxOffice} | Vergi No: ${company.taxNumber}</p>` : ''}
    </div>
    <div class="invoice-info">
      <div class="invoice-number">FATURA</div>
      <p><strong>Fatura No:</strong> ${invoice.invoice_number}</p>
      <p><strong>Tarih:</strong> ${formatDate(invoice.issue_date)}</p>
      ${invoice.due_date ? `<p><strong>Vade:</strong> ${formatDate(invoice.due_date)}</p>` : ''}
    </div>
  </div>

  <div class="customer-info">
    <h3>Fatura Edilen:</h3>
    <p><strong>${invoice.customers?.name || 'Müşteri'}</strong></p>
    <p>${invoice.customers?.address || ''}</p>
    ${invoice.customers?.phone ? `<p>Tel: ${invoice.customers.phone}</p>` : ''}
  </div>

  <table>
    <thead>
      <tr>
        <th>Ürün/Malzeme</th>
        <th>Miktar</th>
        <th>Birim Fiyat</th>
        <th>Toplam</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.invoice_items?.map((item: any) => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td>${formatCurrency(item.total)}</td>
        </tr>
      `).join('') || ''}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Ara Toplam:</td>
        <td>${formatCurrency(invoice.subtotal)}</td>
      </tr>
      <tr>
        <td>KDV (%20):</td>
        <td>${formatCurrency(invoice.tax_amount)}</td>
      </tr>
      <tr class="total-row">
        <td>GENEL TOPLAM:</td>
        <td>${formatCurrency(invoice.total_amount)}</td>
      </tr>
    </table>
  </div>

  ${invoice.notes ? `
    <div style="margin-top: 30px;">
      <p><strong>Notlar:</strong></p>
      <p>${invoice.notes}</p>
    </div>
  ` : ''}

  <div class="footer">
    <p>Bu belge elektronik ortamda oluşturulmuştur.</p>
    <p>${company.name} - ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
  `

  return html
}


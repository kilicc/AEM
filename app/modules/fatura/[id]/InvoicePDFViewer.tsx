'use client'

import { useEffect, useRef } from 'react'

interface InvoicePDFViewerProps {
  html: string
}

export default function InvoicePDFViewer({ html }: InvoicePDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    }
  }, [html])

  return (
    <div className="border rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        className="w-full h-[800px] border-0"
        title="Fatura Önizleme"
      />
    </div>
  )
}


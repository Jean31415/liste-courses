import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannedRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 280, height: 150 },
        aspectRatio: 1.0,
      },
      (decodedText) => {
        if (scannedRef.current) return
        scannedRef.current = true

        // Vibrate on success
        if (navigator.vibrate) navigator.vibrate(100)

        scanner.stop().then(() => {
          onScan(decodedText)
        }).catch(() => {
          onScan(decodedText)
        })
      },
      () => {
        // Ignore scan failures (no barcode in frame)
      }
    ).catch((err) => {
      console.error('Scanner error:', err)
    })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onScan])

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <span>Scanner un code-barres</span>
        <button className="scanner-close" onClick={onClose}>✕</button>
      </div>
      <div className="scanner-viewport">
        <div id="barcode-reader" />
        <div className="scanner-crosshair" />
      </div>
      <p className="scanner-hint">Placez le code-barres dans le cadre</p>
    </div>
  )
}

import { useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onScan, onClose }: Props) {
  const scannedRef = useRef(false)
  const onScanRef = useRef(onScan)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const handleScan = useCallback((decodedText: string) => {
    if (scannedRef.current) return
    scannedRef.current = true
    if (navigator.vibrate) navigator.vibrate(100)
    onScanRef.current(decodedText)
  }, [])

  useEffect(() => {
    let scanner: Html5Qrcode | null = null
    let mounted = true

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode('barcode-reader', { verbose: false })

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
          },
          (decodedText) => {
            if (!mounted) return
            handleScan(decodedText)
          },
          () => {}
        )
      } catch (err) {
        console.error('Camera error:', err)
        if (mounted) {
          alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
          onClose()
        }
      }
    }

    startScanner()

    return () => {
      mounted = false
      const s = scanner
      scanner = null
      if (s) {
        s.stop()
          .then(() => {
            try { s.clear() } catch { /* noop: DOM may already be gone */ }
          })
          .catch(() => { /* stop can throw if not running — ignore */ })
      }
    }
  }, [handleScan, onClose])

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

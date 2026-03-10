import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface UseScannerOptions {
  elementId: string
  onScan: (code: string) => void
  enabled?: boolean
}

export function useScanner({ elementId, onScan, enabled = true }: UseScannerOptions) {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    if (!enabled) return

    const scanner = new Html5Qrcode(elementId)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (code) => {
        if (navigator.vibrate) navigator.vibrate(50)
        onScan(code)
      },
      undefined
    ).catch(console.error)

    return () => {
      scanner.isScanning && scanner.stop().catch(console.error)
    }
  }, [elementId, enabled])

  return scannerRef
}

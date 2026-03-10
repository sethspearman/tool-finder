import { useEffect, useId } from 'react'
import { useScanner } from '@/hooks/useScanner'
import { X } from 'lucide-react'

interface Props {
  title: string
  onScan: (code: string) => void
  onClose: () => void
}

export function ScannerDialog({ title, onScan, onClose }: Props) {
  const id = useId().replace(/:/g, '')
  const elementId = `scanner-${id}`

  useScanner({ elementId, onScan: (code) => { onScan(code) } })

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      <div className="flex items-center justify-between p-4 text-white">
        <p className="font-semibold">{title}</p>
        <button onClick={onClose}><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div id={elementId} className="w-full max-w-sm" />
      </div>
      <p className="text-center text-sm text-white/60 pb-6">
        Point your camera at a QR code or barcode
      </p>
    </div>
  )
}

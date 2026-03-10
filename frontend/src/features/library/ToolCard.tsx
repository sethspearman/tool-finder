import type { Tool } from '@/types'
import { useState } from 'react'
import { api } from '@/lib/api'
import { enqueueAction } from '@/lib/db'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { MapPin, LogOut, LogIn } from 'lucide-react'
import { ScannerDialog } from '@/components/ScannerDialog'

interface Props {
  tool: Tool
  onUpdate: (updated: Tool) => void
}

export function ToolCard({ tool: initial, onUpdate }: Props) {
  const online = useOnlineStatus()
  const [tool, setTool] = useState(initial)
  const [scanningCheckin, setScanningCheckin] = useState(false)

  function apply(updated: Tool) {
    setTool(updated)
    onUpdate(updated)
  }

  async function handleCheckout() {
    if (online) {
      apply(await api.tools.checkout(tool.id))
    } else {
      await enqueueAction({
        actionId: crypto.randomUUID(),
        type: 'Checkout',
        barcodeId: tool.barcodeId,
        occurredAt: new Date().toISOString(),
      })
      apply({ ...tool, isCheckedOut: true, currentLocationId: undefined, locationPath: undefined })
    }
  }

  async function handleCheckinScan(locationQrCode: string) {
    setScanningCheckin(false)
    if (online) {
      const location = await api.locations.byQr(locationQrCode)
      apply(await api.tools.checkin(tool.id, location.id))
    } else {
      await enqueueAction({
        actionId: crypto.randomUUID(),
        type: 'Checkin',
        barcodeId: tool.barcodeId,
        locationQrCode,
        occurredAt: new Date().toISOString(),
      })
      apply({ ...tool, isCheckedOut: false })
    }
  }

  return (
    <li className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate">{tool.displayName}</p>
          {tool.description && (
            <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
          )}
          {tool.locationPath && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {tool.locationPath}
            </p>
          )}
          {tool.isCheckedOut && (
            <p className="mt-1 text-xs text-amber-600 font-medium">Checked out</p>
          )}
        </div>

        {tool.photoUrl && (
          <img src={tool.photoUrl} alt={tool.displayName}
            className="h-12 w-12 rounded object-cover shrink-0" />
        )}
      </div>

      <div className="mt-2 flex gap-2 justify-end">
        {!tool.isCheckedOut && (
          <button
            onClick={handleCheckout}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LogOut className="h-3 w-3" /> Check out
          </button>
        )}
        {tool.isCheckedOut && (
          <button
            onClick={() => setScanningCheckin(true)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <LogIn className="h-3 w-3" /> Check in
          </button>
        )}
      </div>

      {scanningCheckin && (
        <ScannerDialog
          title="Scan destination location"
          onScan={handleCheckinScan}
          onClose={() => setScanningCheckin(false)}
        />
      )}
    </li>
  )
}

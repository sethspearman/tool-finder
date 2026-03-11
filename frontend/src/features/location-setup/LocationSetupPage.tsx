import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cacheLocations } from '@/lib/db'
import type { Location } from '@/types'
import { Button } from '@/components/ui/button'
import { LocationTree } from './LocationTree'
import { CreateLocationDialog } from './CreateLocationDialog'
import { ScannerDialog } from '@/components/ScannerDialog'
import { ScanLine } from 'lucide-react'

export function LocationSetupPage() {
  const [tree, setTree] = useState<Location[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [parentId, setParentId] = useState<number | undefined>()
  const [scannedQr, setScannedQr] = useState<string | undefined>()

  async function load() {
    const data = await api.locations.tree()
    setTree(data)
    await cacheLocations(data)
  }

  useEffect(() => { load() }, [])

  function handleAddChild(id: number) {
    setParentId(id)
    setScannedQr(undefined)
    setShowCreate(true)
  }

  async function handleScan(qrCode: string) {
    setScanning(false)
    // Check if this label is already registered
    try {
      await api.locations.byQr(qrCode)
      // Already exists — just reload so it's visible in the tree
      load()
    } catch {
      // Not found — open the form pre-filled with the scanned QR code
      setScannedQr(qrCode)
      setParentId(undefined)
      setShowCreate(true)
    }
  }

  async function handleCreate(name: string, description?: string) {
    await api.locations.create({ name, description, parentLocationId: parentId, qrCode: scannedQr })
    setShowCreate(false)
    setScannedQr(undefined)
    setParentId(undefined)
    load()
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Location Setup</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setScanning(true)}>
            <ScanLine className="h-4 w-4 mr-1" /> Scan label
          </Button>
          <Button size="sm" onClick={() => { setParentId(undefined); setScannedQr(undefined); setShowCreate(true) }}>
            + Manual
          </Button>
        </div>
      </div>

      {tree.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No locations yet. Scan a pre-printed label or add one manually.
        </p>
      ) : (
        <LocationTree nodes={tree} onAddChild={handleAddChild} onRefresh={load} />
      )}

      {scanning && (
        <ScannerDialog
          title="Scan location label"
          onScan={handleScan}
          onClose={() => setScanning(false)}
        />
      )}

      {showCreate && (
        <CreateLocationDialog
          parentId={parentId}
          scannedQr={scannedQr}
          onConfirm={handleCreate}
          onClose={() => { setShowCreate(false); setScannedQr(undefined) }}
        />
      )}
    </div>
  )
}

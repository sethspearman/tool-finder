import { useState } from 'react'
import { api } from '@/lib/api'
import type { Tool, Location } from '@/types'
import { ScannerDialog } from '@/components/ScannerDialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, RotateCcw, ScanLine } from 'lucide-react'

type Step = 'idle' | 'scan-tool' | 'scan-location' | 'done'

interface LastPlacement {
  tool: Tool
  location: Location
}

export function ToolPlacementPage() {
  const [step, setStep] = useState<Step>('idle')
  const [pendingTool, setPendingTool] = useState<Tool | null>(null)
  const [last, setLast] = useState<LastPlacement | null>(null)

  async function handleToolScan(barcode: string) {
    const tool = await api.tools.byBarcode(barcode)
    setPendingTool(tool)
    setStep('scan-location')
  }

  async function handleLocationScan(qrCode: string) {
    const location = await api.locations.byQr(qrCode)
    await api.tools.place(pendingTool!.id, location.id)
    setLast({ tool: pendingTool!, location })
    setPendingTool(null)
    setStep('done')
  }

  async function handleUndo() {
    if (!last) return
    await api.tools.place(last.tool.id, last.tool.currentLocationId ?? 0)
    setLast(null)
    setStep('idle')
  }

  return (
    <div className="p-4 flex flex-col gap-6 items-center">
      <h1 className="text-lg font-bold self-start">Tool Placement</h1>

      {step === 'idle' && (
        <div className="flex flex-col items-center gap-4 py-12">
          <ScanLine className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground text-sm text-center">
            Scan a tool barcode to begin placing it.
          </p>
          <Button onClick={() => setStep('scan-tool')}>Start scanning</Button>
        </div>
      )}

      {step === 'done' && last && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
          <p className="font-semibold">{last.tool.displayName}</p>
          <p className="text-sm text-muted-foreground">placed in <strong>{last.location.name}</strong></p>

          <div className="flex gap-2 mt-2">
            <Button variant="outline" onClick={handleUndo}>
              <RotateCcw className="h-4 w-4 mr-1" /> Undo
            </Button>
            <Button onClick={() => setStep('scan-tool')}>Next tool</Button>
          </div>
        </div>
      )}

      {step === 'scan-tool' && (
        <ScannerDialog
          title="Scan tool barcode"
          onScan={handleToolScan}
          onClose={() => setStep('idle')}
        />
      )}

      {step === 'scan-location' && pendingTool && (
        <ScannerDialog
          title={`Place "${pendingTool.displayName}" — scan location`}
          onScan={handleLocationScan}
          onClose={() => { setPendingTool(null); setStep('idle') }}
        />
      )}
    </div>
  )
}

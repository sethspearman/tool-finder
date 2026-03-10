import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Tool } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScannerDialog } from '@/components/ScannerDialog'
import { Barcode, PenLine, Trash2 } from 'lucide-react'

export function ToolSetupPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [scanning, setScanning] = useState(false)
  const [form, setForm] = useState<Partial<Tool> | null>(null)

  async function load() {
    setTools(await api.tools.list())
  }

  useEffect(() => { load() }, [])

  function handleScan(barcodeId: string) {
    setScanning(false)
    setForm({ barcodeId })
  }

  async function handleSave() {
    if (!form?.barcodeId || !form?.displayName) return
    await api.tools.create({
      barcodeId: form.barcodeId,
      displayName: form.displayName,
      description: form.description,
      handwrittenId: form.handwrittenId,
      upcCode: form.upcCode,
    })
    setForm(null)
    load()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this tool?')) return
    await api.tools.delete(id)
    load()
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Tool Setup</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setForm({ barcodeId: crypto.randomUUID().slice(0, 12) })}>
            <PenLine className="h-4 w-4 mr-1" /> Manual entry
          </Button>
          <Button size="sm" onClick={() => setScanning(true)}>
            <Barcode className="h-4 w-4 mr-1" /> Scan to add
          </Button>
        </div>
      </div>

      {form && (
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
          <Input
            placeholder="Barcode / ID *"
            value={form.barcodeId ?? ''}
            onChange={e => setForm(f => ({ ...f, barcodeId: e.target.value }))}
          />
          <Input placeholder="Display name *" value={form.displayName ?? ''}
            onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
          <Input placeholder="Description" value={form.description ?? ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Input placeholder="Handwritten ID" value={form.handwrittenId ?? ''}
            onChange={e => setForm(f => ({ ...f, handwrittenId: e.target.value }))} />
          <Input placeholder="UPC code" value={form.upcCode ?? ''}
            onChange={e => setForm(f => ({ ...f, upcCode: e.target.value }))} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button disabled={!form.barcodeId?.trim() || !form.displayName?.trim()} onClick={handleSave}>
              Save tool
            </Button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {tools.map(tool => (
          <li key={tool.id} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{tool.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{tool.barcodeId}</p>
            </div>
            <button onClick={() => handleDelete(tool.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {scanning && (
        <ScannerDialog title="Scan tool barcode" onScan={handleScan} onClose={() => setScanning(false)} />
      )}
    </div>
  )
}

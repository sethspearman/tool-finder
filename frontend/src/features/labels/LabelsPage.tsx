import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Printer } from 'lucide-react'

export function LabelsPage() {
  const [count, setCount] = useState(20)
  const [size, setSize] = useState<'small' | 'large'>('large')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/labels/generate?count=${count}&size=${size}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to generate labels')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tool-finder-labels.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <h1 className="text-lg font-bold">Print Labels</h1>

      <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Generate blank labels to print and affix before setup. Each label contains
          a unique QR code and a human-readable ID. Scan them during Location Setup
          or Tool Setup to assign names.
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Label size</label>
          <div className="flex gap-2">
            <button
              onClick={() => setSize('large')}
              className={`flex-1 rounded-lg border p-3 text-sm text-left transition-colors ${
                size === 'large'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'hover:bg-muted'
              }`}
            >
              <p className="font-medium">Large — 1" square</p>
              <p className="text-xs text-muted-foreground">Avery 94103 · For locations</p>
            </button>
            <button
              onClick={() => setSize('small')}
              className={`flex-1 rounded-lg border p-3 text-sm text-left transition-colors ${
                size === 'small'
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'hover:bg-muted'
              }`}
            >
              <p className="font-medium">Small — 3/4" square</p>
              <p className="text-xs text-muted-foreground">Avery 94102 · For tools</p>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Number of labels</label>
          <Input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-32"
          />
          <p className="text-xs text-muted-foreground">
            {size === 'large'
              ? `${Math.ceil(count / 63)} sheet(s) — 63 labels per sheet`
              : `${Math.ceil(count / 108)} sheet(s) — 108 labels per sheet`}
          </p>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="self-start">
          <Printer className="h-4 w-4 mr-2" />
          {loading ? 'Generating…' : 'Download PDF'}
        </Button>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 flex flex-col gap-2">
        <p className="text-sm font-medium">How to use</p>
        <ol className="text-sm text-muted-foreground flex flex-col gap-1 list-decimal list-inside">
          <li>Print this PDF on Avery {size === 'large' ? '94103' : '94102'} label sheets</li>
          <li>Affix labels to your physical locations or tools</li>
          <li>Open <strong>Location Setup</strong> and tap <strong>Scan to add</strong> to scan each location label and give it a name</li>
          <li>Open <strong>Tool Setup</strong> and tap <strong>Scan to add</strong> to register each tool</li>
        </ol>
      </div>
    </div>
  )
}

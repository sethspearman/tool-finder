import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Props {
  parentId?: number
  scannedQr?: string
  onConfirm: (name: string, description?: string) => void
  onClose: () => void
}

export function CreateLocationDialog({ parentId, scannedQr, onConfirm, onClose }: Props) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-background p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            {parentId ? 'Add child location' : 'Add location'}
          </h2>
          <button onClick={onClose}><X className="h-4 w-4" /></button>
        </div>

        {scannedQr && (
          <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 font-mono">
            Label ID: {scannedQr}
          </p>
        )}

        <Input
          placeholder="Name (e.g. Red Bin)"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <Input
          placeholder="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim()} onClick={() => onConfirm(name.trim(), desc.trim() || undefined)}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

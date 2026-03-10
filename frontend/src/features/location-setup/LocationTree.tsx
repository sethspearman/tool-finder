import type { Location } from '@/types'
import { api } from '@/lib/api'
import { ChevronRight, Plus, Printer, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  nodes: Location[]
  onAddChild: (parentId: number) => void
  onRefresh: () => void
  depth?: number
}

export function LocationTree({ nodes, onAddChild, onRefresh, depth = 0 }: Props) {
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map(node => (
        <LocationNode
          key={node.id}
          node={node}
          onAddChild={onAddChild}
          onRefresh={onRefresh}
          depth={depth}
        />
      ))}
    </ul>
  )
}

function LocationNode({ node, onAddChild, onRefresh, depth }: {
  node: Location
  onAddChild: (id: number) => void
  onRefresh: () => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)

  async function handleDelete() {
    if (!confirm(`Delete "${node.name}" and all its children?`)) return
    await api.locations.delete(node.id)
    onRefresh()
  }

  return (
    <li style={{ paddingLeft: depth * 16 }}>
      <div className="flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-muted group">
        <button onClick={() => setExpanded(e => !e)} className="mr-1 text-muted-foreground">
          <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <span className="flex-1 text-sm font-medium">{node.name}</span>
        <span className="text-xs text-muted-foreground hidden group-hover:block">{node.qrCode.slice(0, 8)}…</span>

        <button onClick={() => onAddChild(node.id)} title="Add child location"
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary">
          <Plus className="h-3.5 w-3.5" />
        </button>
        <a href={`/api/locations/${node.id}/qr-label`} target="_blank" title="Print QR label"
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-primary">
          <Printer className="h-3.5 w-3.5" />
        </a>
        <button onClick={handleDelete} title="Delete location"
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && node.children.length > 0 && (
        <LocationTree
          nodes={node.children}
          onAddChild={onAddChild}
          onRefresh={onRefresh}
          depth={depth + 1}
        />
      )}
    </li>
  )
}

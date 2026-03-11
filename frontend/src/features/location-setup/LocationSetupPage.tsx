import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { cacheLocations } from '@/lib/db'
import type { Location } from '@/types'
import { Button } from '@/components/ui/button'
import { LocationTree } from './LocationTree'
import { CreateLocationDialog } from './CreateLocationDialog'

export function LocationSetupPage() {
  const [tree, setTree] = useState<Location[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [parentId, setParentId] = useState<number | undefined>()

  async function load() {
    const data = await api.locations.tree()
    setTree(data)
    await cacheLocations(data)
  }

  useEffect(() => { load() }, [])

  function handleAddChild(id: number) {
    setParentId(id)
    setShowCreate(true)
  }

  async function handleCreate(name: string, description?: string) {
    await api.locations.create({ name, description, parentLocationId: parentId })
    setShowCreate(false)
    setParentId(undefined)
    load()
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Location Setup</h1>
        <Button size="sm" onClick={() => { setParentId(undefined); setShowCreate(true) }}>
          + Root location
        </Button>
      </div>

      {tree.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No locations yet. Add a root location to get started.
        </p>
      ) : (
        <LocationTree nodes={tree} onAddChild={handleAddChild} onRefresh={load} />
      )}

      {showCreate && (
        <CreateLocationDialog
          parentId={parentId}
          onConfirm={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

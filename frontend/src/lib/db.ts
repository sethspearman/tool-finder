/**
 * IndexedDB store for offline action queue and cached data.
 * Uses the `idb` library for a Promise-based API.
 */
import { openDB, type IDBPDatabase } from 'idb'
import type { OfflineAction, Tool, Location } from '@/types'

interface ToolFinderDB {
  'offline-queue': {
    key: string
    value: OfflineAction
  }
  'tools-cache': {
    key: number
    value: Tool
  }
  'locations-cache': {
    key: number
    value: Location
  }
}

let _db: IDBPDatabase<ToolFinderDB> | null = null

export async function getDb() {
  if (_db) return _db
  _db = await openDB<ToolFinderDB>('tool-finder', 1, {
    upgrade(db) {
      db.createObjectStore('offline-queue', { keyPath: 'actionId' })
      db.createObjectStore('tools-cache', { keyPath: 'id' })
      db.createObjectStore('locations-cache', { keyPath: 'id' })
    },
  })
  return _db
}

export async function enqueueAction(action: OfflineAction) {
  const db = await getDb()
  await db.put('offline-queue', action)
}

export async function getQueue(): Promise<OfflineAction[]> {
  const db = await getDb()
  return db.getAll('offline-queue')
}

export async function removeFromQueue(actionId: string) {
  const db = await getDb()
  await db.delete('offline-queue', actionId)
}

export async function cacheTools(tools: Tool[]) {
  const db = await getDb()
  const tx = db.transaction('tools-cache', 'readwrite')
  await Promise.all([...tools.map(t => tx.store.put(t)), tx.done])
}

export async function getCachedTools(): Promise<Tool[]> {
  const db = await getDb()
  return db.getAll('tools-cache')
}

export async function cacheLocations(locations: Location[]) {
  const flat = flattenLocations(locations)
  const db = await getDb()
  const tx = db.transaction('locations-cache', 'readwrite')
  await Promise.all([...flat.map(l => tx.store.put(l)), tx.done])
}

export async function getCachedLocations(): Promise<Location[]> {
  const db = await getDb()
  return db.getAll('locations-cache')
}

function flattenLocations(locations: Location[]): Location[] {
  return locations.flatMap(l => [l, ...flattenLocations(l.children)])
}

import { useState, useEffect, useRef, useCallback } from 'react'
import Fuse from 'fuse.js'
import { api } from '@/lib/api'
import { cacheTools, getCachedTools } from '@/lib/db'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { Tool } from '@/types'
import { Input } from '@/components/ui/input'
import { ToolCard } from './ToolCard'
import { Search, X } from 'lucide-react'

export function LibraryPage() {
  const online = useOnlineStatus()
  const [query, setQuery] = useState('')
  const [allTools, setAllTools] = useState<Tool[]>([])
  const [searchResults, setSearchResults] = useState<Tool[]>([])
  const fuseRef = useRef<Fuse<Tool> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkedOutTools = allTools.filter(t => t.isCheckedOut)
  const searching = query.trim().length > 0

  const load = useCallback(async () => {
    if (online) {
      try {
        const tools = await api.tools.list()
        setAllTools(tools)
        await cacheTools(tools)
      } catch {
        setAllTools(await getCachedTools())
      }
    } else {
      setAllTools(await getCachedTools())
    }
  }, [online])

  useEffect(() => { load() }, [load])

  // Rebuild Fuse index when allTools changes
  useEffect(() => {
    fuseRef.current = new Fuse(allTools, {
      keys: ['displayName', 'description', 'handwrittenId'],
      threshold: 0.35,
    })
  }, [allTools])

  function updateTool(updated: Tool) {
    setAllTools(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  function runSearch(q: string) {
    if (!q.trim()) { setSearchResults([]); return }

    if (!online && fuseRef.current) {
      setSearchResults(fuseRef.current.search(q).map(r => r.item))
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        setSearchResults(await api.tools.search(q))
      } catch {
        setSearchResults(fuseRef.current?.search(q).map(r => r.item) ?? [])
      }
    }, 300)
  }

  function handleQueryChange(q: string) {
    setQuery(q)
    runSearch(q)
  }

  function clearSearch() {
    setQuery('')
    setSearchResults([])
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tools…"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          className="pl-9 pr-9"
          autoFocus
        />
        {searching && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      {searching && (
        <>
          <p className="text-xs text-muted-foreground">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
          {searchResults.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No tools found.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {searchResults.map(tool => (
                <ToolCard key={tool.id} tool={tool} onUpdate={updateTool} />
              ))}
            </ul>
          )}
        </>
      )}

      {/* Default view: checked-out tools */}
      {!searching && (
        <>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Checked Out
            </h2>
            {checkedOutTools.length > 0 && (
              <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5">
                {checkedOutTools.length}
              </span>
            )}
          </div>

          {checkedOutTools.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              No tools currently checked out.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {checkedOutTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} onUpdate={updateTool} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

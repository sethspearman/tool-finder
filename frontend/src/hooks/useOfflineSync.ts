import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getQueue, removeFromQueue } from '@/lib/db'
import { useOnlineStatus } from './useOnlineStatus'

export function useOfflineSync() {
  const online = useOnlineStatus()
  const [queueCount, setQueueCount] = useState(0)

  async function refreshCount() {
    const q = await getQueue()
    setQueueCount(q.length)
  }

  async function flush() {
    const queue = await getQueue()
    if (!queue.length) return

    const res = await api.sync.flush(queue) as { results: { actionId: string; success: boolean }[] }
    for (const result of res.results) {
      if (result.success) await removeFromQueue(result.actionId)
    }
    await refreshCount()
  }

  useEffect(() => {
    refreshCount()
  }, [])

  useEffect(() => {
    if (online) flush()
  }, [online])

  return { online, queueCount, flush, refreshCount }
}

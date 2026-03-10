import { useOfflineSync } from '@/hooks/useOfflineSync'
import { cn } from '@/lib/utils'
import { Wifi, WifiOff, CloudUpload } from 'lucide-react'

export function StatusBar() {
  const { online, queueCount, flush } = useOfflineSync()

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1 text-xs font-medium',
        online ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      )}
    >
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      <span>{online ? 'Online' : 'Offline'}</span>

      {queueCount > 0 && (
        <button
          onClick={flush}
          className="ml-auto flex items-center gap-1 rounded px-2 py-0.5 hover:bg-black/5"
        >
          <CloudUpload className="h-3 w-3" />
          {queueCount} pending
        </button>
      )}
    </div>
  )
}

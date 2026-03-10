import type { Location, Tool, ImportSummary, OfflineAction } from '@/types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

// Locations
export const api = {
  locations: {
    tree: () => request<Location[]>('/locations'),
    get: (id: number) => request<Location>(`/locations/${id}`),
    byQr: (qrCode: string) => request<Location>(`/locations/by-qr/${qrCode}`),
    create: (body: Omit<Location, 'id' | 'qrCode' | 'children'>) =>
      request<Location>('/locations', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Omit<Location, 'id' | 'qrCode' | 'children'>) =>
      request<Location>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request<void>(`/locations/${id}`, { method: 'DELETE' }),
  },

  tools: {
    list: () => request<Tool[]>('/tools'),
    search: (q: string) => request<Tool[]>(`/tools/search?q=${encodeURIComponent(q)}`),
    get: (id: number) => request<Tool>(`/tools/${id}`),
    byBarcode: (barcode: string) => request<Tool>(`/tools/by-barcode/${encodeURIComponent(barcode)}`),
    create: (body: Partial<Tool>) =>
      request<Tool>('/tools', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<Tool>) =>
      request<Tool>(`/tools/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request<void>(`/tools/${id}`, { method: 'DELETE' }),
    place: (id: number, locationId: number) =>
      request<Tool>(`/tools/${id}/place`, { method: 'POST', body: JSON.stringify({ locationId }) }),
    checkout: (id: number) =>
      request<Tool>(`/tools/${id}/checkout`, { method: 'POST' }),
    checkin: (id: number, locationId: number) =>
      request<Tool>(`/tools/${id}/checkin`, { method: 'POST', body: JSON.stringify({ locationId }) }),
    import: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<ImportSummary>('/tools/import', {
        method: 'POST',
        headers: {},
        body: form,
      })
    },
  },

  sync: {
    flush: (actions: OfflineAction[]) =>
      request('/sync/flush', { method: 'POST', body: JSON.stringify({ actions }) }),
  },
}

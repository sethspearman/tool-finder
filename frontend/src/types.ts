export interface Location {
  id: number
  qrCode: string
  name: string
  description?: string
  photoUrl?: string
  parentLocationId?: number
  children: Location[]
}

export interface Tool {
  id: number
  barcodeId: string
  displayName: string
  description?: string
  handwrittenId?: string
  upcCode?: string
  photoUrl?: string
  currentLocationId?: number
  locationPath?: string
  isCheckedOut: boolean
}

export interface CheckoutLog {
  id: number
  toolId: number
  checkedOutAt: string
  checkedInAt?: string
  returnedToLocationId?: number
}

export interface OfflineAction {
  actionId: string
  type: 'Checkout' | 'Checkin'
  barcodeId: string
  locationQrCode?: string
  occurredAt: string
}

export interface ImportRowResult {
  row: number
  success: boolean
  toolName?: string
  error?: string
}

export interface ImportSummary {
  created: number
  skipped: number
  errors: number
  rows: ImportRowResult[]
}

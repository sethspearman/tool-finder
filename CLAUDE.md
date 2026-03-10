# Tool Finder — Architecture & Conventions

## Project Overview
Tool inventory and location tracking app. Users register tools, define nested physical storage locations, place tools into locations, and find/check-out tools during daily use. Built as a PWA for mobile-first use with offline support in Library Mode.

## Folder Structure
```
tool-finder/
├── ToolFinder.sln
├── backend/
│   └── ToolFinder.Api/          # ASP.NET Core Web API (.NET 9)
│       ├── Controllers/          # API controllers (one per resource)
│       ├── Data/                 # AppDbContext, EF migrations
│       ├── Models/               # EF entity classes
│       ├── Services/             # Business logic
│       ├── Program.cs
│       └── appsettings*.json
├── frontend/                    # React 18 + Vite PWA
│   ├── public/                  # Static assets, manifest.json
│   ├── src/
│   │   ├── components/ui/       # shadcn/ui components (added via CLI)
│   │   ├── features/            # Feature slices (one folder per mode)
│   │   │   ├── library/
│   │   │   ├── location-setup/
│   │   │   ├── tool-setup/
│   │   │   └── tool-placement/
│   │   ├── hooks/               # Shared React hooks
│   │   ├── lib/utils.ts         # cn() and other utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── components.json          # shadcn/ui config
│   ├── tailwind.config.js
│   └── vite.config.ts
└── CLAUDE.md
```

## Application Modes
| Mode | Purpose | Requires connectivity |
|---|---|---|
| Library Mode | Find tools, check out/in — **default home screen** | No (offline-capable) |
| Location Setup | Define nested location hierarchy, print QR labels | Yes |
| Tool Setup | Register tools with name, description, barcode | Yes |
| Tool Placement | Assign tools to locations via scan-scan workflow | Yes |

## Backend

### Stack
- .NET 9 / ASP.NET Core Web API
- EF Core 9 + Npgsql (PostgreSQL)
- OpenAPI (built-in `MapOpenApi()`)

### Running
```bash
cd backend/ToolFinder.Api
dotnet restore
dotnet run
# API: http://localhost:5000  |  OpenAPI: http://localhost:5000/openapi
```

### Conventions
- Controllers are thin; business logic lives in `Services/`.
- One controller per resource: `LocationsController`, `ToolsController`, `CheckoutController`, `SyncController`.
- Connection string in `appsettings.Development.json` (`DefaultConnection`). Never commit secrets.
- EF migrations: `dotnet ef migrations add <Name>` from the `ToolFinder.Api` folder.
- Namespace root: `ToolFinder.Api`.

### Data Model (entities to build in `Models/`)
| Entity | Key Fields |
|---|---|
| `Location` | `Id`, `QrCode`, `Name`, `Description`, `PhotoUrl`, `ParentLocationId` (self-ref FK) |
| `Tool` | `Id`, `BarcodeId`, `DisplayName`, `Description`, `HandwrittenId`, `UpcCode`, `PhotoUrl`, `CurrentLocationId` (nullable), `IsCheckedOut` |
| `CheckoutLog` | `Id`, `ToolId`, `CheckedOutAt`, `CheckedInAt`, `ReturnedToLocationId` |

### API Endpoints Summary
```
GET    /locations                          # full tree
POST   /locations
GET    /locations/{id}
PUT    /locations/{id}
DELETE /locations/{id}
GET    /locations/by-qr/{qrCode}
GET    /locations/{id}/qr-label            # SVG/PNG
GET    /locations/qr-sheet?ids=1,2,3       # printable PDF

GET    /tools
POST   /tools
GET    /tools/{id}
PUT    /tools/{id}
DELETE /tools/{id}
GET    /tools/search?q={query}             # full-text + fuzzy
GET    /tools/by-barcode/{barcode}
POST   /tools/{id}/place                   # body: { locationId }
POST   /tools/{id}/checkout
POST   /tools/{id}/checkin                 # body: { locationId }
POST   /tools/import                       # multipart CSV

POST   /sync/flush                         # offline action queue
```

## Frontend

### Stack
- React 18, TypeScript, Vite 6
- Tailwind CSS 3 + shadcn/ui (slate base color, CSS variables)
- PWA: `manifest.json` + service worker (Workbox — to be configured)
- QR scanning: `html5-qrcode` or `@zxing/browser`
- QR generation: `qrcode` (client-side, canvas-based)
- Offline search: `fuse.js` against cached tool data
- Offline queue: IndexedDB
- CSV import: `papaparse`

### Running
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173  (proxies /api/* to http://localhost:5000)
```

### Adding shadcn/ui components
```bash
cd frontend
npx shadcn@latest add button
npx shadcn@latest add input dialog table
# Components land in src/components/ui/
```

### Conventions
- `@/` alias maps to `src/`.
- Feature code lives in `src/features/<mode>/`. Each feature folder owns its own components, hooks, and types.
- Shared UI primitives (shadcn) in `src/components/ui/`.
- Shared hooks (e.g., `useOfflineQueue`, `useScanner`) in `src/hooks/`.
- `cn()` utility from `@/lib/utils` for conditional class merging.
- Library Mode is the default/home route.

### Offline Strategy
- Service worker caches app shell + full tool/location data on first load.
- Check-out/in actions performed offline are queued in IndexedDB.
- On reconnect, queue is flushed via `POST /sync/flush`.
- Conflict resolution: last-write-wins (v1).
- A persistent online/offline + queue-count indicator must always be visible.

## Search
- Server-side: PostgreSQL full-text search (`tsvector`/`tsquery`) via EF Core — matches `DisplayName` + `Description`.
- Offline: Fuse.js against the cached tool list.
- Real-time: search fires as user types (debounced).

## Key UX Rules
- App must be fully usable one-handed on a phone.
- Scan feedback: visual flash + haptic on success.
- Always show full location breadcrumb (e.g., `Garage > Shelf 2 > Red Bin`), never raw IDs.
- Undo last placement/scan must be available in Placement and Library modes.
- Mode switching must not be accidentally triggered during a scan workflow.

## CSV Import Format (Tool bulk import)
Expected columns: `Name`, `Description`, `HandwrittenId`, `UpcCode`
- Parsed client-side with PapaParse, preview before commit.
- API returns per-row success/error summary.
- Duplicate barcodes in import file: skip + report error row.

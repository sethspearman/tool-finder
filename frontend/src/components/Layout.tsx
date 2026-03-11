import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { StatusBar } from './StatusBar'
import { Menu, X, MapPin, Wrench, ArrowRightLeft, ChevronLeft, Printer } from 'lucide-react'

const setupModes = [
  { to: '/location-setup', label: 'Location Setup',  Icon: MapPin,           desc: 'Define your storage hierarchy' },
  { to: '/tool-setup',     label: 'Tool Setup',       Icon: Wrench,           desc: 'Register tools' },
  { to: '/tool-placement', label: 'Tool Placement',   Icon: ArrowRightLeft,   desc: 'Place tools into locations' },
  { to: '/labels',         label: 'Print Labels',     Icon: Printer,          desc: 'Generate Avery label sheets' },
]

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isLibrary = pathname === '/'

  return (
    <div className="flex h-dvh flex-col">
      <StatusBar />

      <header className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        {isLibrary ? (
          <span className="font-bold text-lg">Tool Finder</span>
        ) : (
          <NavLink to="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Library</span>
          </NavLink>
        )}

        <button
          onClick={() => setMenuOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Slide-in menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="w-72 bg-background h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">Setup & Management</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-2">
              {setupModes.map(({ to, label, Icon, desc }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { LayoutDashboard, Users, Castle, ChevronLeft, ChevronRight, Building2, MapPin, Map, X } from 'lucide-react'

function SuperadminSidebar({ activewindow, setactivewindow, isMobileOpen, onMobileClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

 const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'states', label: 'States', icon: Map },
  { id: 'cities', label: 'Cities', icon: Building2 },
  { id: 'areas', label: 'Areas', icon: MapPin },
  { id: 'admins', label: 'Admins', icon: Users },
  { id: 'palaces', label: 'Palaces', icon: Castle },
 ]

  const handleNavigation = (windowId) => {
    setactivewindow(windowId)
    onMobileClose()
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close superadmin navigation"
        onClick={onMobileClose}
        className={`absolute inset-0 z-40 bg-slate-950/50 transition-opacity duration-300 md:hidden ${
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="superadmin-sidebar"
        className={`absolute inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r border-gray-200 bg-white shadow-2xl transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 md:relative md:z-20 md:max-w-none md:translate-x-0 md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
      {/* ── COLLAPSE / UNCOLLAPSE BUTTON ── */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-10 hidden rounded-full border border-gray-200 bg-white p-1.5 text-gray-600 shadow-sm transition-transform hover:bg-gray-100 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 md:block"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ── SIDEBAR HEADER ── */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-4 dark:border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 min-w-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <span className="font-bold text-gray-900 dark:text-white text-base truncate">
              Superadmin
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onMobileClose}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── NAVIGATION BUTTONS ── */}
      <nav className="flex w-full flex-1 flex-col gap-1.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activewindow === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigation(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`group flex w-full shrink-0 items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon
                size={20}
                className={`min-w-5 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`}
              />
              <span className={`ml-3 whitespace-nowrap truncate ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </nav>
      </aside>
    </>
  )
}

export default SuperadminSidebar

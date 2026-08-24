import React, { useState } from 'react'
import { LayoutDashboard, Users, Castle, ChevronLeft, ChevronRight, Building2, MapPin, Map } from 'lucide-react'

function SuperadminSidebar({ activewindow, setactivewindow }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

 const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'states', label: 'States', icon: Map },
  { id: 'cities', label: 'Cities', icon: Building2 },
  { id: 'areas', label: 'Areas', icon: MapPin },
  { id: 'admins', label: 'Admins', icon: Users },
  { id: 'palaces', label: 'Palaces', icon: Castle },
]
  return (
    <aside
      className={`relative z-20 flex h-auto w-full shrink-0 flex-col border-b border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 md:h-full md:border-r md:border-b-0 ${
        isCollapsed ? 'md:w-20' : 'md:w-64'
      }`}
    >
      {/* ── COLLAPSE / UNCOLLAPSE BUTTON ── */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-10 hidden rounded-full border border-gray-200 bg-white p-1.5 text-gray-600 shadow-sm transition-transform hover:bg-gray-100 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 md:block"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ── SIDEBAR HEADER ── */}
      <div className="hidden h-16 items-center border-b border-gray-100 px-4 dark:border-gray-800 md:flex">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 min-w-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          {!isCollapsed && (
            <span className="font-bold text-gray-900 dark:text-white text-base truncate">
              Superadmin
            </span>
          )}
        </div>
      </div>

      {/* ── NAVIGATION BUTTONS ── */}
      <nav className="flex w-full gap-1 overflow-x-auto p-2 md:flex-1 md:flex-col md:space-y-1.5 md:overflow-y-auto md:p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activewindow === item.id

          return (
            <button
              key={item.id}
              onClick={() => setactivewindow(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`group flex w-auto shrink-0 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 md:w-full md:justify-start ${
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
              <span className={`ml-2 whitespace-nowrap md:ml-3 md:truncate ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default SuperadminSidebar

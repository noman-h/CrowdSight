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
      className={`relative flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ── COLLAPSE / UNCOLLAPSE BUTTON ── */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 z-10 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm focus:outline-none transition-transform"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ── SIDEBAR HEADER ── */}
      <div className="flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800">
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
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activewindow === item.id

          return (
            <button
              key={item.id}
              onClick={() => setactivewindow(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
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
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default SuperadminSidebar
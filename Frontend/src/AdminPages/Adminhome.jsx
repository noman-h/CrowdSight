import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import AdminSidebar from './AdminSidebar'
import AdminpalaceManage from './AdminpalaceManage'
import AdminDashboard from './AdminDashboard'

function Adminhome() {
  const [activewindow, setactivewindow] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Map window keys to clean display titles
  const titles = {
    dashboard: 'Admin Dashboard',
    palaces: 'Manage Palaces'
  }

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] min-h-0 w-full overflow-hidden bg-gray-50 transition-colors duration-200 dark:bg-gray-950 md:flex-row">
      
      {/* ── SIDEBAR ── */}
      <AdminSidebar
        activewindow={activewindow}
        setactivewindow={setactivewindow}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 sm:min-h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white md:hidden"
              aria-label="Open sidebar"
              aria-controls="admin-sidebar"
              aria-expanded={isSidebarOpen}
            >
              <Menu size={21} />
            </button>

            <h1 className="min-w-0 truncate text-base font-bold capitalize text-gray-900 dark:text-white sm:text-xl">
              {titles[activewindow] || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
            <span className="hidden sm:inline">Admin Panel</span>
          </div>
        </header>

        {/* Dynamic View Panel */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-gray-50 p-3 transition-colors duration-200 scrollbar-thin scrollbar-thumb-sky-300 dark:bg-gray-950 sm:p-6 lg:p-8">
            
         {/* Toast Notification Container */}
       <Toaster position="bottom-right" reverseOrder={false} />

          <div className="mx-auto w-full min-w-0 max-w-7xl">
            {activewindow === 'dashboard' && <AdminDashboard onNavigate={setactivewindow} />}
            {activewindow === 'palaces' && <AdminpalaceManage />}
          </div>
        </main>
      </div>

    </div>
  )
}

export default Adminhome

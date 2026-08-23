import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import AdminSidebar from './AdminSidebar'
import AdminpalaceManage from './AdminpalaceManage'
import AdminDashboard from './AdminDashboard'

function Adminhome() {
  const [activewindow, setactivewindow] = useState('dashboard')

  // Map window keys to clean display titles
  const titles = {
    dashboard: 'Admin Dashboard',
    palaces: 'Manage Palaces'
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 transition-colors duration-200 overflow-hidden">
      
      {/* ── SIDEBAR ── */}
      <AdminSidebar
        activewindow={activewindow}
        setactivewindow={setactivewindow}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 px-6 sm:px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between transition-colors duration-200">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
            {titles[activewindow] || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
            Admin Panel
          </div>
        </header>

        {/* Dynamic View Panel */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-300 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            
         {/* Toast Notification Container */}
       <Toaster position="bottom-right" reverseOrder={false} />

          <div className="max-w-7xl mx-auto">
            {activewindow === 'dashboard' && <AdminDashboard />}
            {activewindow === 'palaces' && <AdminpalaceManage />}
          </div>
        </main>
      </div>

    </div>
  )
}

export default Adminhome
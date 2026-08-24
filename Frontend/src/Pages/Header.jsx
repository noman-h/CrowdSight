import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, LogOut, KeyRound, LogIn, UserPlus, Sun, Moon, HelpCircle } from 'lucide-react'
import UseTheme from '../Hooks/UseTheme'
import headerlogo from '../assets/headerlogo.svg'

function Header() {
  const token = localStorage.getItem('token')
  const email = localStorage.getItem('email')

  const { theme, toggletheme } = UseTheme()
  const userInitial = email ? email.charAt(0).toUpperCase() : 'U'

  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const container = document.getElementById('profile-dropdown-container')
      if (container && !container.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <header className="w-full sticky top-0 z-50
                       bg-white dark:bg-gray-900
                       border-b border-gray-200 dark:border-gray-800
                       shadow-sm transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={headerlogo}
              alt="CrowdSight Logo"
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 hidden sm:block tracking-tight">
              Crowd
              <span className="text-gray-800 dark:text-white">Sight</span>
            </span>
          </Link>

          {/* ── RIGHT NAV ACTIONS ── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* ── DARK / LIGHT MODE TOGGLE BUTTON ── */}
            <button
              onClick={toggletheme}
              className="p-2 rounded-lg
                         bg-gray-100 dark:bg-gray-800
                         text-gray-600 dark:text-gray-300
                         hover:bg-gray-200 dark:hover:bg-gray-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition-all duration-200"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-amber-400" />
              ) : (
                <Moon size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* ── DESKTOP: NOT LOGGED IN ── */}
            {!token && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/helpandsupport"
                  className="flex items-center gap-1.5 px-3 py-2
                             text-sm font-medium rounded-lg
                             text-gray-600 dark:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-800
                             transition-all duration-200"
                >
                  <HelpCircle size={16} />
                  Help & Support
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2
                             text-sm font-medium rounded-lg
                             text-blue-600 dark:text-blue-400
                             border border-blue-600 dark:border-blue-400
                             hover:bg-blue-50 dark:hover:bg-blue-950/50
                             transition-all duration-200"
                >
                  <LogIn size={15} />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-2
                             text-sm font-medium rounded-lg
                             text-white
                             bg-blue-600 hover:bg-blue-700
                             dark:bg-blue-500 dark:hover:bg-blue-600
                             transition-all duration-200 shadow-sm"
                >
                  <UserPlus size={15} />
                  Sign Up
                </Link>
              </div>
            )}

            {/* ── MOBILE: NOT LOGGED IN (HAMBURGER) ── */}
            {!token && (
              <div className="flex md:hidden items-center">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 rounded-lg
                             bg-gray-100 dark:bg-gray-800
                             text-gray-600 dark:text-gray-300
                             hover:bg-gray-200 dark:hover:bg-gray-700
                             transition-all duration-200"
                  aria-label="Toggle Menu"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            )}

            {/* ── LOGGED IN: PROFILE AVATAR TOGGLE ── */}
            {token && (
              <div className="relative" id="profile-dropdown-container">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center h-10 w-10 
                             rounded-full bg-blue-600 text-white font-semibold text-lg
                             shadow-sm hover:bg-blue-700 focus:outline-none 
                             focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                             dark:focus:ring-offset-gray-900 transition-all duration-200"
                >
                  {userInitial}
                </button>

                {/* Dropdown Menu */}
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg 
                             bg-white dark:bg-gray-800 
                             border border-gray-100 dark:border-gray-700 
                             overflow-hidden transition-all duration-200 origin-top-right
                             ${profileOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}
                >
                  {/* User Email Display */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/40">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {email}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="p-2 space-y-1">
                    <Link
                      to="/helpandsupport"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2
                                 text-sm font-medium rounded-lg
                                 text-gray-700 dark:text-gray-200
                                 hover:bg-gray-100 dark:hover:bg-gray-700/60
                                 transition-all duration-200"
                    >
                      <HelpCircle size={16} className="text-gray-500 dark:text-gray-400" />
                      Help & Support
                    </Link>
                    <Link
                      to="/resetpassword"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2
                                 text-sm font-medium rounded-lg
                                 text-gray-700 dark:text-gray-200
                                 hover:bg-gray-100 dark:hover:bg-gray-700/60
                                 transition-all duration-200"
                    >
                      <KeyRound size={16} className="text-gray-500 dark:text-gray-400" />
                      Reset Password
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2
                                 text-sm font-medium rounded-lg
                                 text-red-600 dark:text-red-400
                                 hover:bg-red-50 dark:hover:bg-red-950/40
                                 transition-all duration-200"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU (LOGGED OUT STATE) ── */}
      {!token && (
        <div
          className={`md:hidden overflow-hidden transition-all duration-300
                      ${menuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-4 pb-4 pt-2 space-y-2
                          bg-white dark:bg-gray-900
                          border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/helpandsupport"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2.5
                         text-sm font-medium rounded-lg
                         text-gray-700 dark:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-200"
            >
              <HelpCircle size={16} />
              Help & Support
            </Link>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2.5
                         text-sm font-medium rounded-lg
                         text-blue-600 dark:text-blue-400
                         border border-blue-600 dark:border-blue-400
                         hover:bg-blue-50 dark:hover:bg-blue-950/50
                         transition-all duration-200"
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2.5
                         text-sm font-medium rounded-lg
                         text-white
                         bg-blue-600 hover:bg-blue-700
                         dark:bg-blue-500 dark:hover:bg-blue-600
                         transition-all duration-200"
            >
              <UserPlus size={16} />
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import headerlogo from '../assets/headerlogo.svg'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react'
import axios from 'axios'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      
      const result=await axios.post(`${import.meta.env.VITE_API_URL}user/login`,{
        email,
        password
      })

      console.log(result);
    if(result.status===200){
       localStorage.setItem('token',result?.data?.token)
      localStorage.setItem('email',result?.data?.user?.email)
      localStorage.setItem('userid',result?.data?.user?._id)
      localStorage.setItem('theme',result?.data?.user?.theme)
      localStorage.setItem('role',result?.data?.user?.role)

      const role=result?.data?.user?.role
      if(role==="superadmin")   navigate('/superadmin')
      if(role==="admin")   navigate('/admin')
    
    }
       if (!email || !password) {
        throw new Error('Please enter both email and password.')
      }

      // Redirect to home/dashboard page after login
      // navigate('/')
      window.location.reload() // Refresh to update Header state instantly
    } catch (err) {
      
      setError(err?.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center 
                    bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl 
                      shadow-xl border border-gray-100 dark:border-gray-700">
        
        {/* ── HEADER & BRANDING ── */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <img
              src={headerlogo}
              alt="CrowdSight Logo"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
              Crowd<span className="text-gray-800 dark:text-white">Sight</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please enter your Login info to access your account
          </p>
        </div>

        {/* ── ERROR MESSAGE ── */}
        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 
                          border border-red-200 dark:border-red-800 
                          text-red-600 dark:text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* ── FORM ── */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                           bg-gray-50 dark:bg-gray-900/50 
                           border border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-white placeholder-gray-400
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                to="/forgotpassword"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 
                           hover:underline focus:outline-none"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm
                           bg-gray-50 dark:bg-gray-900/50 
                           border border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-white placeholder-gray-400
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center 
                           text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                           focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                       rounded-xl text-sm font-semibold text-white
                       bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                       dark:bg-blue-500 dark:hover:bg-blue-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       dark:focus:ring-offset-gray-800
                       disabled:opacity-60 disabled:cursor-not-allowed
                       shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* ── FOOTER LINK ── */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 
                         hover:underline focus:outline-none"
            >
              Sign up
              <ArrowRight size={14} />
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login
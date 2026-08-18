import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import headerlogo from '../assets/headerlogo.svg'
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react'
import axios from 'axios'

function Signup() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
     
      const result=await axios.post(`${import.meta.env.VITE_API_URL}user/signup`,{
        ...formData
      })
      
      if(result.status===201) alert('Singup Successfull')
    
      setTimeout(()=>{
        navigate('/login')
      },1000)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create account. Please try again.')
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
            Create an account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join CrowdSight to get started today
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
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                           bg-gray-50 dark:bg-gray-900/50 
                           border border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-white placeholder-gray-400
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Email Address Input */}
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
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                           bg-gray-50 dark:bg-gray-900/50 
                           border border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-white placeholder-gray-400
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mt-2
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
                Creating account...
              </span>
            ) : (
              <>
                <UserPlus size={18} />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* ── FOOTER LINK ── */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 
                         hover:underline focus:outline-none"
            >
              Log in
              <ArrowRight size={14} />
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Signup
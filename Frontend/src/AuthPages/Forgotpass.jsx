import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Mail, ShieldCheck, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

function Forgotpass() {
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/'

  // Step state: 1 = Email, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1)

  // Form states
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI status states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [timer, setTimer] = useState(0)

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  // Clear messages when step changes
  const changeStep = (nextStep) => {
    setError('')
    setMessage('')
    setStep(nextStep)
  }

  // ─── 1. API CALL: SEND OTP ───
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) return setError('Please enter your email address.')

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE}user/forgototpsend`, { email })
      setMessage(response?.data?.message || 'OTP sent successfully to your email!')
      setTimer(60) // Start 60s cooldown for resend
      changeStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.')
    } finally {
      setLoading(false)
    }
  }

  // ─── 2. API CALL: VERIFY OTP ───
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp) return setError('Please enter the OTP.')

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE}user/forgototpverify`, { email, otp })
      setMessage(response.data?.message || 'OTP verified successfully!')
      changeStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── 3. API CALL: RESET PASSWORD ───
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      return setError('Please fill in all password fields.')
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long.')
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await axios.post(`${API_BASE}user/forgotpassword`, {
        email,
        otp,
        newPassword
      })
      setMessage(response.data?.message || 'Password reset successfully!')
      changeStep(4)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8 transition-all">

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step === s
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : step > s
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-colors ${
                      step > s ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Set New Password'}
            {step === 4 && 'Password Reset Complete!'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {step === 1 && "Enter your email address to receive a 6-digit verification code."}
            {step === 2 && `We sent a code to ${email}`}
            {step === 3 && 'Choose a strong password for your account.'}
            {step === 4 && 'Your password has been changed. You can now log in.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {message && step !== 4 && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
            {message}
          </div>
        )}

        {/* ─── STEP 1: REQUEST OTP ─── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Code'}
            </button>
          </form>
        )}

        {/* ─── STEP 2: VERIFY OTP ─── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-widest text-center font-mono text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify Code'}
            </button>

            {/* Resend OTP Link */}
            <div className="text-center pt-2">
              {timer > 0 ? (
                <span className="text-xs text-gray-400">Resend code in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Didn't receive code? Resend
                </button>
              )}
            </div>
          </form>
        )}

        {/* ─── STEP 3: NEW PASSWORD ─── */}
        {step === 3 && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Reset Password'}
            </button>
          </form>
        )}

        {/* ─── STEP 4: SUCCESS ─── */}
        {step === 4 && (
          <div className="text-center space-y-4">
            <div className="flex justify-center text-green-500">
              <CheckCircle2 size={56} />
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        {step < 4 && (
          <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

export default Forgotpass
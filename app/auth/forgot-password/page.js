'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [countdown, setCountdown] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send reset link')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      if (data.resetLink) {
        setResetLink(data.resetLink)
      }
      
      setCountdown(60)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      setIsLoading(false)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-gray-900">
                InsureInfra
              </h1>
            </Link>
            <p className="text-gray-500 mt-2 text-sm">Reset your password</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 text-sm font-medium mb-1">
                    Reset link sent!
                  </p>
                  <p className="text-green-700 text-xs">
                    Check your email for the password reset link. It will expire in 1 hour.
                  </p>
                </div>
              </div>
              {resetLink && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-700 mb-2">Development mode - Reset link:</p>
                  <a
                    href={resetLink}
                    className="text-xs text-green-800 hover:text-green-900 break-all underline"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
            </div>
          )}

          {!success ? (
            <>
              <p className="text-gray-600 text-sm mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              {countdown > 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Didn't receive the email? You can resend in {countdown}s
                </p>
              ) : (
                <button
                  onClick={() => {
                    setSuccess(false)
                    setResetLink('')
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 font-medium rounded-lg py-3 px-4 transition-all duration-200"
                >
                  Send Another Link
                </button>
              )}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

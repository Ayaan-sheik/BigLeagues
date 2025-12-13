'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  OAuthSignin: 'Error starting OAuth sign-in flow.',
  OAuthCallback: 'Error handling OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth account.',
  EmailCreateAccount: 'Could not create email account.',
  Callback: 'Error in OAuth callback handler.',
  OAuthAccountNotLinked: 'Email already in use with different sign-in method.',
  EmailSignin: 'Check your email for the sign-in link.',
  CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
  SessionRequired: 'Please sign in to access this page.',
  default: 'An authentication error occurred. Please try again.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessage = errorMessages[error] || errorMessages.default

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Glass card */}
      <div className="relative w-full max-w-md">
        <div className="relative bg-slate-800/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                InsureInfra
              </h1>
            </Link>
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/20 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
            <p className="text-slate-400 text-sm">We encountered a problem</p>
          </div>

          {/* Error message */}
          <div className="mb-8 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-4">
            <p className="text-red-200 text-sm text-center">{errorMessage}</p>
            {error && (
              <p className="text-red-300/50 text-xs text-center mt-2 font-mono">
                Error code: {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 backdrop-blur-sm text-white font-semibold rounded-lg py-3 px-4 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Link>
            
            <Link
              href="/"
              className="w-full bg-slate-700/50 backdrop-blur-sm hover:bg-slate-700 border border-white/10 text-white font-medium rounded-lg py-3 px-4 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-xs">
              Need help?{' '}
              <Link href="/support" className="text-blue-400 hover:text-blue-300">
                Contact support
              </Link>
            </p>
          </div>
        </div>

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 blur-2xl" />
      </div>
    </div>
  )
}

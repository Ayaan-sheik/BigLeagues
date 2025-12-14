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
    <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Vandage
              </h1>
            </Link>
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-500 text-sm">We encountered a problem</p>
          </div>

          {/* Error message */}
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm text-center">{errorMessage}</p>
            {error && (
              <p className="text-red-500 text-xs text-center mt-2 font-mono">
                Error code: {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold rounded-lg py-3 px-4 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Link>
            
            <Link
              href="/"
              className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 font-medium rounded-lg py-3 px-4 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Need help?{' '}
              <Link href="/support" className="text-gray-900 hover:text-gray-700 font-medium">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

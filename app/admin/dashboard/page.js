'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, Shield, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/customer/dashboard')
      } else {
        fetchProfile()
      }
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">InsureInfra Admin</h1>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-gray-900 text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {session?.user?.name || 'Admin'}!
              </h2>
              <p className="text-gray-600">{session?.user?.email}</p>
              
              {profile ? (
                <div className="mt-4">
                  {profile.kycStatus === 'pending' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-200 rounded-full">
                      <AlertCircle className="w-4 h-4 text-yellow-700" />
                      <span className="text-sm text-yellow-700 font-medium">
                        Profile Under Review
                      </span>
                    </div>
                  )}
                  {profile.kycStatus === 'approved' && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-200 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-700" />
                      <span className="text-sm text-green-700 font-medium">
                        Profile Approved
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/admin/onboarding')}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg transition-all"
                  >
                    Complete Profile Setup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info message */}
        {profile && profile.kycStatus === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Your Profile is Under Review</h3>
            <p className="text-yellow-800 text-sm">
              Our team is reviewing your application. You'll receive an email notification within 2-3 business days.
              Meanwhile, you can explore the platform features.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Company</h3>
            <p className="text-2xl font-bold text-gray-900">{profile?.companyName || 'N/A'}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Products Offered</h3>
            <p className="text-2xl font-bold text-gray-900">{profile?.productsOffered?.length || 0}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <p className="text-2xl font-bold text-gray-900 capitalize">{profile?.kycStatus || 'Incomplete'}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

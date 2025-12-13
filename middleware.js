import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin1')
    const isCustomerRoute = req.nextUrl.pathname.startsWith('/customer1')
    const isOnboarding = req.nextUrl.pathname.includes('/onboarding')

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      // Check if profile is completed
      const profileCompleted = token?.profileCompleted
      const role = token?.role
      
      if (!profileCompleted) {
        // Redirect to onboarding based on role
        if (role === 'admin') {
          return NextResponse.redirect(new URL('/admin1/onboarding', req.url))
        } else {
          return NextResponse.redirect(new URL('/customer1/onboarding', req.url))
        }
      }
      
      // If profile completed, go to dashboard
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin1/dashboard', req.url))
      } else {
        return NextResponse.redirect(new URL('/customer1/dashboard', req.url))
      }
    }

    // Protect dashboard routes
    if (isDashboard && !isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    
    // If trying to access dashboard but onboarding not complete
    if ((isDashboard || isAdminRoute || isCustomerRoute) && isAuth && !isOnboarding) {
      const profileCompleted = token?.profileCompleted
      const role = token?.role
      
      if (!profileCompleted) {
        if (role === 'admin') {
          return NextResponse.redirect(new URL('/admin1/onboarding', req.url))
        } else {
          return NextResponse.redirect(new URL('/customer1/onboarding', req.url))
        }
      }
    }

    // Protect admin routes
    if (isAdminRoute) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/customer1/dashboard', req.url))
      }
    }

    // Protect customer routes
    if (isCustomerRoute) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      if (token?.role !== 'customer') {
        return NextResponse.redirect(new URL('/admin1/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Handle authorization in the middleware function above
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin1/:path*', '/customer1/:path*', '/auth/:path*'],
}

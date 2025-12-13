import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Protect dashboard routes
    if (isDashboard && !isAuth) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Protect admin routes
    if (isAdmin) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
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
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}

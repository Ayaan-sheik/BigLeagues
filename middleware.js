import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // Public routes that don't need authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password']
  
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'))) {
    return NextResponse.next()
  }

  // If not authenticated, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/customer', req.url))
    }
  }

  // Protect customer routes
  if (pathname.startsWith('/customer')) {
    if (token.role !== 'customer') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  // Protect API routes based on role
  if (pathname.startsWith('/api/admin') && token.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (pathname.startsWith('/api/customer') && token.role !== 'customer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/customer/:path*',
    '/api/admin/:path*',
    '/api/customer/:path*',
  ],
}

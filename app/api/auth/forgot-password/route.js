import { NextResponse } from 'next/server'
import { createPasswordResetToken } from '@/lib/auth'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = forgotPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { email } = validation.data
    
    try {
      const { token, user } = await createPasswordResetToken(email)
      
      // In production, send email with reset link
      // For now, we'll return the token in the response (development only)
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`
      
      console.log('Password reset link:', resetLink)
      
      // Always return success to prevent email enumeration
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
        // Remove this in production - only for development
        ...(process.env.NODE_ENV === 'development' && { resetLink }),
      })
    } catch (error) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      })
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

/**
 * Public API endpoint to record payments using API key
 * Used by startups to track payments with insurance premiums
 */
export async function POST(request) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_KEY'
        },
        { status: 401 }
      )
    }

    const apiKey = authHeader.replace('Bearer ', '')

    // Validate API key and get user
    const db = await getDb()
    const profile = await db.collection('startup_profiles')
      .findOne({ apiKey })

    if (!profile) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid API key'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      payment_id,
      order_id,
      service_id,
      service_name,
      base_amount,
      premium_amount,
      total_amount,
      insurer_name,
      customer_email,
      customer_phone
    } = body

    // Validation
    if (!payment_id || !service_name || !total_amount) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          message: 'Missing required fields: payment_id, service_name, total_amount'
        },
        { status: 400 }
      )
    }

    // Check for duplicate payment_id
    const existingPayment = await db.collection('customer_payments')
      .findOne({ payment_id, userId: profile.userId })
    
    if (existingPayment) {
      return NextResponse.json(
        { 
          error: 'Duplicate Payment',
          message: 'Payment with this payment_id already exists'
        },
        { status: 409 }
      )
    }

    // Create payment record
    const payment = {
      userId: profile.userId,
      payment_id,
      order_id: order_id || `order_${Date.now()}`,
      service_id: service_id || `service_${Date.now()}`,
      service_name,
      base_amount: base_amount || 0,
      premium_amount: premium_amount || 0,
      total_amount,
      insurer_name: insurer_name || 'Vantage',
      customer_email,
      customer_phone,
      premium_paid: false,
      created_at: new Date(),
      updated_at: new Date()
    }

    await db.collection('customer_payments').insertOne(payment)

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment_id: payment.payment_id,
        order_id: payment.order_id,
        service_name: payment.service_name,
        total_amount: payment.total_amount,
        premium_amount: payment.premium_amount,
        created_at: payment.created_at
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Post payment error:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to record payment'
      },
      { status: 500 }
    )
  }
}

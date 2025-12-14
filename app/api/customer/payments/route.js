import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDb } from '@/lib/db'

// POST - Record a new payment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    if (!payment_id || !order_id || !service_name || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: payment_id, order_id, service_name, total_amount' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Create payment record
    const payment = {
      userId: session.user.id,
      payment_id,
      order_id,
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
      payment: {
        payment_id: payment.payment_id,
        service_name: payment.service_name,
        total_amount: payment.total_amount
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Post payment error:', error)
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}

// GET - Fetch customer's payments
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    
    // Get all payments for this customer
    const payments = await db.collection('customer_payments')
      .find({ userId: session.user.id })
      .sort({ created_at: -1 })
      .toArray()

    // Calculate summary
    const summary = {
      total_revenue: payments.reduce((sum, p) => sum + (p.total_amount || 0), 0),
      total_base: payments.reduce((sum, p) => sum + (p.base_amount || 0), 0),
      total_premium: payments.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
      total_payments: payments.length,
      with_insurance: payments.filter(p => p.premium_amount > 0).length,
      without_insurance: payments.filter(p => p.premium_amount === 0).length
    }

    return NextResponse.json({ payments, summary })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

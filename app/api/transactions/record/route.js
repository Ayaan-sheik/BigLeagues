import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// Public API endpoint for recording transactions via API key
export async function POST(request) {
  try {
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const db = await getDb()
    
    // Find startup by API key
    const profile = await db.collection('startup_profiles').findOne({ apiKey })
    
    if (!profile) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const body = await request.json()
    const { productSold, saleAmount, premiumAmount, customerInfo, policyId } = body

    // Validate required fields
    if (!productSold || !saleAmount || !premiumAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: productSold, saleAmount, premiumAmount' },
        { status: 400 }
      )
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

    // Get policy details if provided
    let policy = null
    if (policyId) {
      policy = await db.collection('policies').findOne({ 
        id: policyId,
        userId: profile.userId,
        status: 'active'
      })
    }

    const transaction = {
      id: uuidv4(),
      transactionId,
      userId: profile.userId,
      apiKey,
      startupName: profile.companyName,
      productSold,
      saleAmount: parseFloat(saleAmount),
      premiumAmount: parseFloat(premiumAmount),
      policyId: policyId || null,
      policyType: policy?.productName || 'General Coverage',
      customerInfo: customerInfo || {},
      status: 'completed',
      settlementStatus: 'pending',
      date: new Date(),
      createdAt: new Date(),
    }

    await db.collection('transactions').insertOne(transaction)

    // Update policy premium collected if policy exists
    if (policy) {
      await db.collection('policies').updateOne(
        { id: policyId },
        { 
          $inc: { 
            totalPremiumCollected: parseFloat(premiumAmount),
            transactionCount: 1
          },
          $set: { updatedAt: new Date() }
        }
      )
    }

    // Create notification for startup
    await db.collection('notifications').insertOne({
      id: uuidv4(),
      type: 'transaction_recorded',
      title: 'Premium Collected',
      message: `₹${premiumAmount} premium collected from ${productSold} sale`,
      entityType: 'transaction',
      entityId: transaction.id,
      userId: profile.userId,
      read: false,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      transaction: {
        transactionId: transaction.transactionId,
        premiumAmount: transaction.premiumAmount,
        policyType: transaction.policyType,
        status: transaction.status,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Record transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to record transaction' },
      { status: 500 }
    )
  }
}

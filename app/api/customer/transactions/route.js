import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    
    // Get startup profile for API key
    const profile = await db.collection('startup_profiles')
      .findOne({ userId: session.user.id })
    
    if (!profile || !profile.apiKey) {
      return NextResponse.json({ transactions: [] })
    }

    const transactions = await db.collection('transactions')
      .find({ apiKey: profile.apiKey })
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    // Get startup profile
    const profile = await db.collection('startup_profiles')
      .findOne({ userId: session.user.id })
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const transaction = {
      id: uuidv4(),
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId: session.user.id,
      apiKey: profile.apiKey,
      ...body,
      date: new Date(),
      createdAt: new Date(),
    }

    await db.collection('transactions').insertOne(transaction)

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

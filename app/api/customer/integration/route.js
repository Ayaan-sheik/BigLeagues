import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import crypto from 'crypto'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const profile = await db.collection('startup_profiles')
      .findOne({ userId: session.user.id })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      apiKey: profile.apiKey || null,
      webhookUrl: profile.webhookUrl || '',
      environment: profile.environment || 'sandbox',
      lastKeyGenerated: profile.lastKeyGenerated || null,
    })
  } catch (error) {
    console.error('Get integration error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
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

    if (body.action === 'generate_key') {
      // Generate new API key
      const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`
      
      await db.collection('startup_profiles').updateOne(
        { userId: session.user.id },
        { 
          $set: { 
            apiKey,
            lastKeyGenerated: new Date(),
            updatedAt: new Date()
          } 
        }
      )

      return NextResponse.json({ apiKey })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Integration action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    await db.collection('startup_profiles').updateOne(
      { userId: session.user.id },
      { 
        $set: { 
          webhookUrl: body.webhookUrl,
          environment: body.environment || 'sandbox',
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update integration error:', error)
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

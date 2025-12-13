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
    const profile = await db.collection('startup_profiles').findOne({
      userId: session.user.id
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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

    const existing = await db.collection('startup_profiles').findOne({
      userId: session.user.id
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    const profile = {
      id: uuidv4(),
      userId: session.user.id,
      ...body,
      onboardingStatus: 'pending_review',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection('startup_profiles').insertOne(profile)

    // Update user profileCompleted flag
    await db.collection('users').updateOne(
      { id: session.user.id },
      { 
        $set: { 
          profileCompleted: true,
          onboardingCompletedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
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

    const result = await db.collection('startup_profiles').findOneAndUpdate(
      { userId: session.user.id },
      { 
        $set: { 
          ...body,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile: result.value })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

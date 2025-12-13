import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const profile = await db.collection('insurer_profiles').findOne({
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    // Check if profile already exists
    const existing = await db.collection('insurer_profiles').findOne({
      userId: session.user.id
    })

    let profile

    if (existing) {
      // Update existing profile
      const result = await db.collection('insurer_profiles').findOneAndUpdate(
        { userId: session.user.id },
        { 
          $set: { 
            ...body,
            kycStatus: 'pending',
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      )
      profile = result.value
    } else {
      // Create new profile
      profile = {
        id: uuidv4(),
        userId: session.user.id,
        ...body,
        kycStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.collection('insurer_profiles').insertOne(profile)
    }

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

    return NextResponse.json({ profile }, { status: existing ? 200 : 201 })
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    const result = await db.collection('insurer_profiles').findOneAndUpdate(
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

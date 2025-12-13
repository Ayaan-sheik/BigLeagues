import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDb } from '@/lib/db'

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { step, data, role } = await request.json()
    const db = await getDb()

    // Determine collection based on role
    const collection = role === 'admin' ? 'insurer_profiles' : 'startup_profiles'

    // Check if profile exists
    let profile = await db.collection(collection).findOne({
      userId: session.user.id
    })

    // Deep merge function to handle nested objects
    const deepMerge = (target, source) => {
      const output = { ...target }
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = deepMerge(target[key] || {}, source[key])
        } else {
          output[key] = source[key]
        }
      }
      return output
    }

    if (profile) {
      // Merge with existing data to preserve previous steps
      const mergedData = deepMerge(profile, data)
      
      // Update existing profile with merged data
      await db.collection(collection).updateOne(
        { userId: session.user.id },
        { 
          $set: { 
            ...mergedData,
            userId: session.user.id, // Ensure userId is preserved
            updatedAt: new Date()
          } 
        }
      )
    } else {
      // Create new draft profile
      const { v4: uuidv4 } = require('uuid')
      await db.collection(collection).insertOne({
        id: uuidv4(),
        userId: session.user.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Update user's onboarding step
    await db.collection('users').updateOne(
      { id: session.user.id },
      { 
        $set: { 
          onboardingStep: step,
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({ success: true, message: 'Saved' })
  } catch (error) {
    console.error('Auto-save error:', error)
    return NextResponse.json(
      { error: 'Failed to save' },
      { status: 500 }
    )
  }
}

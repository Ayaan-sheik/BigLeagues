import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDb } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDb()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const query = { userId: session.user.id }
    if (unreadOnly) query.read = false
    
    const notifications = await db.collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    const unreadCount = await db.collection('notifications')
      .countDocuments({ userId: session.user.id, read: false })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = await getDb()

    if (body.markAllRead) {
      await db.collection('notifications').updateMany(
        { userId: session.user.id, read: false },
        { $set: { read: true, readAt: new Date() } }
      )
      return NextResponse.json({ success: true })
    }

    if (body.notificationId) {
      await db.collection('notifications').updateOne(
        { id: body.notificationId, userId: session.user.id },
        { $set: { read: true, readAt: new Date() } }
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

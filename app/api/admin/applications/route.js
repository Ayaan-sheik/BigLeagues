import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const applications = await db
      .collection('applications')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

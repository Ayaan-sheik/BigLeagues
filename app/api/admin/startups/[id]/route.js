import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;

    const startup = await db.collection('startups').findOne({ id });

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Fetch related data
    const policies = await db.collection('policies').find({ startupId: id }).toArray();
    const transactions = await db
      .collection('transactions')
      .find({ startupId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    const claims = await db
      .collection('claims')
      .find({ startupId: id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      startup,
      policies,
      transactions,
      claims,
    });
  } catch (error) {
    console.error('Error fetching startup details:', error);
    return NextResponse.json({ error: 'Failed to fetch startup details' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    const result = await db.collection('startups').updateOne(
      { id },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    const updatedStartup = await db.collection('startups').findOne({ id });

    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error('Error updating startup:', error);
    return NextResponse.json({ error: 'Failed to update startup' }, { status: 500 });
  }
}

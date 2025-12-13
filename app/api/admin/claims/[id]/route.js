import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function PATCH(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    const result = await db.collection('claims').updateOne(
      { id },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const updatedClaim = await db.collection('claims').findOne({ id });

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}

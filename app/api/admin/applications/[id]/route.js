import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function PATCH(request, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = params;
    const body = await request.json();

    const result = await db.collection('applications').updateOne(
      { id },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updatedApp = await db.collection('applications').findOne({ id });

    return NextResponse.json(updatedApp);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

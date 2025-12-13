import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    console.log('Dropping collections...');
    const collections = ['startups', 'policies', 'transactions', 'claims', 'applications', 'products', 'settings'];

    for (const col of collections) {
      try {
        await db.collection(col).drop();
        console.log(`Dropped ${col}`);
      } catch (err) {
        console.log(`Collection ${col} does not exist, skipping...`);
      }
    }

    return NextResponse.json({ success: true, message: 'Database cleared. Refresh any page to reseed.' });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
}

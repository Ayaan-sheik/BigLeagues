import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    let checklists = await db.collection('compliance_checklists').find({}).toArray();

    // If no checklists, create defaults
    if (checklists.length === 0) {
      const { v4: uuidv4 } = await import('uuid');
      const defaultItems = [
        {
          id: uuidv4(),
          title: 'IRDAI Annual Registration Renewal',
          dueDate: new Date('2025-12-31'),
          completionStatus: 'completed',
          completedBy: 'Admin',
          completedAt: new Date('2024-11-15'),
          frequency: 'annual',
        },
        {
          id: uuidv4(),
          title: 'Q1 Financial Audit Report',
          dueDate: new Date('2025-03-31'),
          completionStatus: 'in-progress',
          completedBy: null,
          completedAt: null,
          frequency: 'quarterly',
        },
        {
          id: uuidv4(),
          title: 'Data Protection Impact Assessment',
          dueDate: new Date('2025-01-31'),
          completionStatus: 'completed',
          completedBy: 'Admin',
          completedAt: new Date('2024-12-10'),
          frequency: 'annual',
        },
        {
          id: uuidv4(),
          title: 'Insurance Policy Templates Review',
          dueDate: new Date('2025-02-28'),
          completionStatus: 'pending',
          completedBy: null,
          completedAt: null,
          frequency: 'annual',
        },
        {
          id: uuidv4(),
          title: 'Claims Settlement Ratio Report',
          dueDate: new Date('2024-12-15'),
          completionStatus: 'pending',
          completedBy: null,
          completedAt: null,
          frequency: 'monthly',
        },
      ];

      await db.collection('compliance_checklists').insertMany(defaultItems);
      checklists = defaultItems;
    }

    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Error fetching compliance checklists:', error);
    return NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 });
  }
}

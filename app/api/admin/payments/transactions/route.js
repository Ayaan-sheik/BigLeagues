import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch all transactions
    const transactions = await db
      .collection('transactions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // Calculate stats
    const totalPremium = transactions.reduce((sum, t) => sum + (t.premium || 0), 0);
    const totalTransactions = transactions.length;
    const settledTransactions = transactions.filter(t => t.settlementStatus === 'completed');
    const pendingTransactions = transactions.filter(t => t.settlementStatus !== 'completed');
    const settledPremium = settledTransactions.reduce((sum, t) => sum + (t.premium || 0), 0);
    const pendingPremium = pendingTransactions.reduce((sum, t) => sum + (t.premium || 0), 0);

    const stats = {
      totalPremium,
      totalTransactions,
      settledCount: settledTransactions.length,
      pendingCount: pendingTransactions.length,
      settledPremium,
      pendingPremium,
    };

    return NextResponse.json({ transactions, stats });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

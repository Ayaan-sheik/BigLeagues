import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';
import { seedMockData } from '@/lib/mock-data';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Seed mock data if not exists
    await seedMockData(db);

    // Calculate stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Total Active Policies
    const totalPolicies = await db.collection('policies').countDocuments({ status: 'active' });

    // Premium Collected MTD
    const transactionsMTD = await db
      .collection('transactions')
      .find({ createdAt: { $gte: monthStart } })
      .toArray();
    const premiumMTD = transactionsMTD.reduce((sum, t) => sum + (t.premium || 0), 0);

    // Premium Collected YTD
    const transactionsYTD = await db
      .collection('transactions')
      .find({ createdAt: { $gte: yearStart } })
      .toArray();
    const premiumYTD = transactionsYTD.reduce((sum, t) => sum + (t.premium || 0), 0);

    // Active Startups
    const activeStartups = await db.collection('startups').countDocuments({ status: 'active' });

    // Pending Claims
    const pendingClaims = await db
      .collection('claims')
      .countDocuments({ status: { $in: ['new', 'under_investigation'] } });

    // Approval Queue
    const approvalQueue = await db
      .collection('applications')
      .countDocuments({ status: 'under_review' });

    // New Applications
    const newApplications = await db.collection('applications').countDocuments({ status: 'new' });

    // Urgent Claims
    const urgentClaims = await db.collection('claims').countDocuments({ priority: 'high' });

    // Average Premium per Transaction
    const allTransactions = await db.collection('transactions').find().toArray();
    const totalPremium = allTransactions.reduce((sum, t) => sum + (t.premium || 0), 0);
    const avgPremiumPerTxn = allTransactions.length > 0 ? totalPremium / allTransactions.length : 0;

    // Top Startups by Premium (MTD)
    const topStartups = await db
      .collection('startups')
      .find({ status: 'active' })
      .sort({ totalPremiumMTD: -1 })
      .limit(5)
      .toArray();

    const topStartupsData = topStartups.map((s) => ({
      id: s.id,
      name: s.name,
      industry: s.industry,
      premium: s.totalPremiumMTD || 0,
      policies: s.totalPolicies || 0,
    }));

    return NextResponse.json({
      totalPolicies,
      premiumMTD,
      premiumYTD,
      activeStartups,
      pendingClaims,
      approvalQueue,
      newApplications,
      urgentClaims,
      avgPremiumPerTxn,
      topStartups: topStartupsData,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

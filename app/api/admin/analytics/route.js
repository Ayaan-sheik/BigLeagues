import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total Premium
    const transactions = await db.collection('transactions').find({ createdAt: { $gte: startDate } }).toArray();
    const totalPremium = transactions.reduce((sum, t) => sum + (t.premium || 0), 0);
    const avgPremium = transactions.length > 0 ? totalPremium / transactions.length : 0;

    // Loss Ratio
    const claims = await db.collection('claims').find({ createdAt: { $gte: startDate } }).toArray();
    const totalClaimsPaid = claims
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
    const lossRatio = totalPremium > 0 ? (totalClaimsPaid / totalPremium) * 100 : 0;

    // Conversion Rate
    const applications = await db.collection('applications').find({ createdAt: { $gte: startDate } }).toArray();
    const approvedApps = applications.filter((a) => a.status === 'approved').length;
    const conversionRate = applications.length > 0 ? (approvedApps / applications.length) * 100 : 0;

    // Premium Trend (daily)
    const premiumTrend = [];
    const dateMap = {};

    transactions.forEach((t) => {
      const date = new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dateMap[date] = (dateMap[date] || 0) + (t.premium || 0);
    });

    Object.keys(dateMap).forEach((date) => {
      premiumTrend.push({ date, premium: dateMap[date] });
    });

    // Policy Distribution
    const policies = await db.collection('policies').find({}).toArray();
    const productMap = {};

    policies.forEach((p) => {
      productMap[p.productName] = (productMap[p.productName] || 0) + 1;
    });

    const policyDistribution = Object.keys(productMap).map((name) => ({
      name,
      count: productMap[name],
    }));

    // Top Startups
    const startups = await db.collection('startups').find({ status: 'active' }).sort({ totalPremiumMTD: -1 }).limit(5).toArray();
    const topStartups = startups.map((s) => ({
      name: s.name,
      premium: s.totalPremiumMTD || 0,
    }));

    // Claims by Product
    const claimProductMap = {};
    claims.forEach((c) => {
      claimProductMap[c.productName] = (claimProductMap[c.productName] || 0) + 1;
    });

    const claimsByProduct = Object.keys(claimProductMap).map((product) => ({
      product,
      count: claimProductMap[product],
    }));

    return NextResponse.json({
      totalPremium,
      avgPremium,
      lossRatio,
      conversionRate,
      premiumTrend,
      policyDistribution,
      topStartups,
      claimsByProduct,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

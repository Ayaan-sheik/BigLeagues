import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all transactions (for accurate total premium)
    const allTransactions = await db.collection('transactions').find({}).toArray();
    const totalPremium = allTransactions.reduce((sum, t) => sum + (t.premium || 0), 0);
    const avgPremium = allTransactions.length > 0 ? totalPremium / allTransactions.length : 0;
    
    // Number of premiums done (total transaction count)
    const numberOfPremiums = allTransactions.length;
    
    // Highest premium (max premium from any transaction)
    const highestPremium = allTransactions.length > 0 
      ? Math.max(...allTransactions.map(t => t.premium || 0))
      : 0;

    // Conversion Rate - use all applications
    const allApplications = await db.collection('applications').find({}).toArray();
    const approvedApps = allApplications.filter((a) => a.status === 'approved').length;
    const conversionRate = allApplications.length > 0 ? (approvedApps / allApplications.length) * 100 : 0;

    // Premium Trend (daily)
    const premiumTrend = [];
    const dateMap = {};

    allTransactions.forEach((t) => {
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

    // Top Startups - Calculate from ACTUAL transactions, not static field
    const startupPremiumMap = {};
    
    allTransactions.forEach((t) => {
      const startupId = t.startupId;
      const startupName = t.startupName;
      if (!startupPremiumMap[startupId]) {
        startupPremiumMap[startupId] = {
          name: startupName,
          premium: 0,
        };
      }
      startupPremiumMap[startupId].premium += (t.premium || 0);
    });

    // Convert to array, sort by premium, and get top 5
    const topStartups = Object.values(startupPremiumMap)
      .sort((a, b) => b.premium - a.premium)
      .slice(0, 5);

    // Claims by Product - use ALL claims from database
    const allClaims = await db.collection('claims').find({}).toArray();
    const claimProductMap = {};
    
    allClaims.forEach((c) => {
      const productName = c.productName || 'Unknown';
      claimProductMap[productName] = (claimProductMap[productName] || 0) + 1;
    });

    const claimsByProduct = Object.keys(claimProductMap).map((product) => ({
      product: product.length > 25 ? product.substring(0, 25) + '...' : product,
      count: claimProductMap[product],
    }));

    // If no claims, return placeholder
    if (claimsByProduct.length === 0) {
      claimsByProduct.push({ product: 'No Claims', count: 0 });
    }

    return NextResponse.json({
      totalPremium,
      avgPremium,
      numberOfPremiums,
      highestPremium,
      conversionRate,
      premiumTrend: premiumTrend.length > 0 ? premiumTrend : [{ date: 'No Data', premium: 0 }],
      policyDistribution: policyDistribution.length > 0 ? policyDistribution : [{ name: 'No Policies', count: 0 }],
      topStartups: topStartups.length > 0 ? topStartups : [{ name: 'No Startups', premium: 0 }],
      claimsByProduct,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

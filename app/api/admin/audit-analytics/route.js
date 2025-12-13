import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch audit logs for the period
    const auditLogs = await db.collection('audit_logs').find({
      timestamp: { $gte: startDate }
    }).toArray();

    // Total Events
    const totalEvents = auditLogs.length;

    // Unique Users
    const uniqueUsers = new Set(auditLogs.map(log => log.user || 'System')).size;

    // Critical Events
    const criticalEvents = auditLogs.filter(log => log.severity === 'critical');

    // Average Response Time
    const responseTimes = auditLogs.filter(log => log.responseTime).map(log => log.responseTime);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length)
      : 0;

    // Top Users (Activity Count)
    const userActivityMap = {};
    auditLogs.forEach(log => {
      const user = log.user || 'System';
      userActivityMap[user] = (userActivityMap[user] || 0) + 1;
    });

    const topUsers = Object.keys(userActivityMap)
      .map(user => ({ user, count: userActivityMap[user] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily Volume for Chart
    const dailyMap = {};
    auditLogs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dailyMap[date] = (dailyMap[date] || 0) + 1;
    });

    const dailyVolume = Object.keys(dailyMap)
      .map(date => ({ date, count: dailyMap[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({
      totalEvents,
      uniqueUsers,
      criticalEvents: criticalEvents.slice(0, 5),
      avgResponseTime,
      topUsers,
      dailyVolume,
    });
  } catch (error) {
    console.error('Error fetching audit analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch audit analytics' }, { status: 500 });
  }
}

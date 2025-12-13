import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    let reports = await db.collection('irdai_reports').find({}).sort({ generatedDate: -1 }).toArray();

    // If no reports, create sample ones
    if (reports.length === 0) {
      const { v4: uuidv4 } = await import('uuid');
      
      // Calculate actual metrics from database
      const transactions = await db.collection('transactions').find({}).toArray();
      const claims = await db.collection('claims').find({ status: 'paid' }).toArray();
      
      const totalPremium = transactions.reduce((sum, t) => sum + (t.premium || 0), 0);
      const totalClaimsPaid = claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);
      
      const lossRatio = totalPremium > 0 ? ((totalClaimsPaid / totalPremium) * 100).toFixed(2) : '0.00';
      const solvencyRatio = '125.50'; // Placeholder calculation
      
      const sampleReports = [
        {
          id: uuidv4(),
          reportType: 'Premium Collection Report - Q4 2024',
          periodStart: new Date('2024-10-01'),
          periodEnd: new Date('2024-12-31'),
          generatedDate: new Date(),
          generatedBy: 'Admin',
          status: 'draft',
          lossRatio: lossRatio,
          solvencyRatio: solvencyRatio,
          submissionDeadline: new Date('2025-01-15'),
        },
        {
          id: uuidv4(),
          reportType: 'Quarterly Solvency Report - Q3 2024',
          periodStart: new Date('2024-07-01'),
          periodEnd: new Date('2024-09-30'),
          generatedDate: new Date('2024-10-10'),
          generatedBy: 'Admin',
          status: 'submitted',
          lossRatio: '45.20',
          solvencyRatio: '132.80',
          submissionDeadline: new Date('2024-10-15'),
          submittedDate: new Date('2024-10-12'),
        },
      ];

      await db.collection('irdai_reports').insertMany(sampleReports);
      reports = sampleReports;
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching IRDAI reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

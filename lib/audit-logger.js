import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db-admin';

// Audit Logger Utility
export async function logAuditEvent({
  user = 'Admin',
  action,
  entityType,
  entityId = null,
  method,
  endpoint,
  status,
  changes = null,
  severity = 'low',
  responseTime = 0,
}) {
  try {
    const { db } = await connectToDatabase();
    const { v4: uuidv4 } = await import('uuid');

    const auditLog = {
      id: uuidv4(),
      timestamp: new Date(),
      user,
      action,
      entityType,
      entityId,
      method,
      endpoint,
      status,
      severity,
      responseTime,
      changes: sanitizeData(changes),
      ipAddress: 'localhost', // In production, get from request
      createdAt: new Date(),
    };

    await db.collection('audit_logs').insertOne(auditLog);
    console.log('Audit log created:', action, entityType);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should never break the main flow
  }
}

// Sanitize sensitive data
function sanitizeData(data) {
  if (!data) return null;
  
  const sensitive = ['password', 'secret', 'token', 'apiKey', 'api_key', 'dodoApiKey', 'dodoSecretKey', 'emailApiKey'];
  const sanitized = JSON.parse(JSON.stringify(data));
  
  function recursiveSanitize(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    for (const key in obj) {
      if (sensitive.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        recursiveSanitize(obj[key]);
      }
    }
    return obj;
  }
  
  return recursiveSanitize(sanitized);
}

// Calculate diff between before and after
export function calculateDiff(original, updated) {
  if (!original || !updated) return null;
  
  const diff = {};
  for (const key in updated) {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      diff[key] = {
        from: original[key],
        to: updated[key],
      };
    }
  }
  
  return Object.keys(diff).length > 0 ? diff : null;
}

// Determine action type from method and path
export function determineAction(method, path) {
  if (method === 'POST') return 'create';
  if (method === 'PATCH' || method === 'PUT') {
    if (path.includes('approve')) return 'approve';
    if (path.includes('reject')) return 'reject';
    return 'update';
  }
  if (method === 'DELETE') return 'delete';
  if (method === 'GET') return 'read';
  return 'unknown';
}

// Determine severity based on action and entity
export function determineSeverity(action, entityType, status) {
  // Critical: Failed operations, deletions, security events
  if (status >= 500) return 'critical';
  if (action === 'delete') return 'high';
  if (action === 'approve' || action === 'reject') return 'medium';
  if (status >= 400) return 'medium';
  return 'low';
}

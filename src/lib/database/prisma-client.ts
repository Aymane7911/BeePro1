import { PrismaClient } from '@prisma/client';
import { tenantManager } from './tenant-manager';
import { headers } from 'next/headers';

export async function getPrismaClient(tenantId?: string): Promise<PrismaClient> {
  if (!tenantId) {
    const headersList = headers();
    tenantId = headersList.get('x-tenant-id') || undefined;
  }
  
  if (!tenantId) {
    throw new Error('Tenant ID not found');
  }
  
  return await tenantManager.getTenantClient(tenantId);
}

// Helper function for API routes
export function getTenantId(request: Request): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new Error('Tenant ID not found in request headers');
  }
  return tenantId;
}
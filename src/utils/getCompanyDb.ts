// utils/getCompanyDb.ts
import { headers } from 'next/headers';
import DatabaseManager from './database';

export async function getCompanyDatabase() {
  const headersList = headers();
  const companyId = headersList.get('x-company-id');
  
  if (!companyId) {
    throw new Error('Company ID not found in request headers');
  }
  
  const dbManager = DatabaseManager.getInstance();
  return await dbManager.getCompanyDatabase(companyId);
}

export async function getMasterDatabase() {
  const dbManager = DatabaseManager.getInstance();
  return dbManager.getMasterDatabase();
}
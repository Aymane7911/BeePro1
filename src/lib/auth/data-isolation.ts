// lib/auth/data-isolation.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CompanyContext {
  companyId: string;
  userId: number;
  role: string;
}

/**
 * Get company-scoped Prisma client that automatically filters by company
 */
export function getCompanyScopedPrisma(companyId: string) {
  return {
    // Users scoped to company
    beeusers: {
      findMany: (args?: any) => prisma.beeusers.findMany({
        ...args,
        where: { ...args?.where, companyId }
      }),
      findFirst: (args?: any) => prisma.beeusers.findFirst({
        ...args,
        where: { ...args?.where, companyId }
      }),
      findUnique: (args?: any) => prisma.beeusers.findUnique({
        ...args,
        where: { ...args?.where, companyId }
      }),
      create: (args: any) => prisma.beeusers.create({
        ...args,
        data: { ...args.data, companyId }
      }),
      update: (args: any) => prisma.beeusers.update({
        ...args,
        where: { ...args.where, companyId }
      }),
      delete: (args: any) => prisma.beeusers.delete({
        ...args,
        where: { ...args.where, companyId }
      }),
      count: (args?: any) => prisma.beeusers.count({
        ...args,
        where: { ...args?.where, companyId }
      })
    },

    // Batches scoped to company
    batch: {
      findMany: (args?: any) => prisma.batch.findMany({
        ...args,
        where: { ...args?.where, companyId }
      }),
      findFirst: (args?: any) => prisma.batch.findFirst({
        ...args,
        where: { ...args?.where, companyId }
      }),
      findUnique: (args?: any) => prisma.batch.findUnique({
        ...args,
        where: { ...args?.where, companyId }
      }),
      create: (args: any) => prisma.batch.create({
        ...args,
        data: { ...args.data, companyId }
      }),
      update: (args: any) => prisma.batch.update({
        ...args,
        where: { ...args.where, companyId }
      }),
      delete: (args: any) => prisma.batch.delete({
        ...args,
        where: { ...args.where, companyId }
      }),
      count: (args?: any) => prisma.batch.count({
        ...args,
        where: { ...args?.where, companyId }
      })
    },

    // Apiaries scoped to company
    apiary: {
      findMany: (args?: any) => prisma.apiary.findMany({
        ...args,
        where: { ...args?.where, companyId }
      }),
      findFirst: (args?: any) => prisma.apiary.findFirst({
        ...args,
        where: { ...args?.where, companyId }
      }),
      create: (args: any) => prisma.apiary.create({
        ...args,
        data: { ...args.data, companyId }
      }),
      update: (args: any) => prisma.apiary.update({
        ...args,
        where: { ...args.where, companyId }
      }),
      delete: (args: any) => prisma.apiary.delete({
        ...args,
        where: { ...args.where, companyId }
      }),
      count: (args?: any) => prisma.apiary.count({
        ...args,
        where: { ...args?.where, companyId }
      })
    },

    // Certifications scoped to company
    certification: {
      findMany: (args?: any) => prisma.certification.findMany({
        ...args,
        where: { ...args?.where, companyId }
      }),
      findFirst: (args?: any) => prisma.certification.findFirst({
        ...args,
        where: { ...args?.where, companyId }
      }),
      create: (args: any) => prisma.certification.create({
        ...args,
        data: { ...args.data, companyId }
      }),
      update: (args: any) => prisma.certification.update({
        ...args,
        where: { ...args.where, companyId }
      }),
      delete: (args: any) => prisma.certification.delete({
        ...args,
        where: { ...args.where, companyId }
      }),
      count: (args?: any) => prisma.certification.count({
        ...args,
        where: { ...args?.where, companyId }
      })
    },

    // Direct access to company
    company: {
      findUnique: () => prisma.company.findUnique({
        where: { id: companyId }
      }),
      update: (args: any) => prisma.company.update({
        where: { id: companyId },
        data: args.data
      })
    },

    // Transaction support
    $transaction: prisma.$transaction.bind(prisma),
    $disconnect: prisma.$disconnect.bind(prisma)
  };
}

/**
 * Middleware to validate company access
 */
export async function validateCompanyAccess(userId: number, companyId: string): Promise<CompanyContext | null> {
  try {
    const user = await prisma.beeusers.findFirst({
      where: { 
        id: userId,
        companyId: companyId 
      },
      include: {
        company: true
      }
    });

    if (!user || !user.company?.isActive) {
      return null;
    }

    return {
      companyId: user.companyId!,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.error('Error validating company access:', error);
    return null;
  }
}

/**
 * Check if user has admin privileges for the company
 */
export async function validateAdminAccess(userId: number, companyId: string): Promise<boolean> {
  try {
    const user = await prisma.beeusers.findFirst({
      where: { 
        id: userId,
        companyId: companyId,
        role: 'admin'
      },
      include: {
        company: true
      }
    });

    return user?.company?.isActive === true;
  } catch (error) {
    console.error('Error validating admin access:', error);
    return false;
  }
}

/**
 * Get company statistics
 */
export async function getCompanyStats(companyId: string) {
  try {
    const companyScopedPrisma = getCompanyScopedPrisma(companyId);
    
    const [
      totalUsers,
      totalBatches,
      totalApiaries,
      totalCertifications,
      activeUsers,
      activeBatches
    ] = await Promise.all([
      companyScopedPrisma.beeusers.count(),
      companyScopedPrisma.batch.count(),
      companyScopedPrisma.apiary.count(),
      companyScopedPrisma.certification.count(),
      companyScopedPrisma.beeusers.count({ where: { isConfirmed: true } }),
      companyScopedPrisma.batch.count({ where: { status: 'Active' } })
    ]);

    return {
      totalUsers,
      totalBatches,
      totalApiaries,
      totalCertifications,
      activeUsers,
      activeBatches
    };
  } catch (error) {
    console.error('Error fetching company stats:', error);
    return null;
  }
}

/**
 * Get company with user limits check
 */
export async function getCompanyWithLimits(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            batches: true
          }
        }
      }
    });

    if (!company) return null;

    return {
      ...company,
      currentUsers: company._count.users,
      currentBatches: company._count.batches,
      canAddUsers: company._count.users < company.maxUsers,
      canAddBatches: company._count.batches < company.maxBatches
    };
  } catch (error) {
    console.error('Error fetching company with limits:', error);
    return null;
  }
}
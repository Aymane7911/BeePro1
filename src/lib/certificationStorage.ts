// lib/certificationStorage.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CertificationData {
  batchIds: string[];
  certificationDate: string;
  totalCertified: string;
  certificationType: string;
  expiryDate: string;
  verification: string;
  totalJars: number;
  databaseId: string;
}

interface UserProfile {
  id: string;
  companyName?: string;
  name?: string;
  location?: string;
}

// Function to store certification data (call this in your handleCompleteBatch function)
export async function storeCertificationData(
  certData: CertificationData, 
  userProfile: UserProfile
) {
  try {
    const certification = await prisma.certification.create({
  data: {
    verificationCode: certData.verification,
    batchIds: certData.batchIds.join(','),
    certificationDate: new Date(certData.certificationDate),
    totalCertified: parseFloat(certData.totalCertified),
    certificationType: certData.certificationType,
    expiryDate: new Date(certData.expiryDate),
    totalJars: certData.totalJars,
    companyName: userProfile.companyName || null,
    beekeeperName: userProfile.name || null,
    location: userProfile.location || null,
    userId: parseInt(userProfile.id), // Convert string to number
    databaseId: certData.databaseId, // Don't forget this required field!
  },
});

    console.log('Certification stored successfully:', certification.id);
    return certification;
  } catch (error) {
    console.error('Error storing certification data:', error);
    throw error;
  }
}

// Function to fetch certification data (used by the API)
export async function fetchCertificationData(verificationCode: string) {
  try {
    const certification = await prisma.certification.findFirst({
  where: { 
    verificationCode: verificationCode 
  },
  include: {
    user: {
      select: {
        firstname: true,
        lastname: true,
      }
    }
  }
});

    if (!certification) {
      return null;
    }

    return {
  batchIds: certification.batchIds.split(','),
  certificationDate: certification.certificationDate.toISOString().split('T')[0],
  totalCertified: certification.totalCertified.toString(),
  certificationType: certification.certificationType,
  expiryDate: certification.expiryDate.toISOString().split('T')[0],
  verification: certification.verificationCode,
  totalJars: certification.totalJars,
  companyName: certification.companyName, // Only use from certification
  beekeeperName: certification.beekeeperName || `${certification.user?.firstname} ${certification.user?.lastname}`.trim(),
  location: certification.location, // Only use from certification
  createdAt: certification.createdAt.toISOString()
};
  } catch (error) {
    console.error('Error fetching certification data:', error);
    throw error;
  }
}

// Function to get all certifications for a user
export async function getUserCertifications(userId: string) {
  try {
    const certifications = await prisma.certification.findMany({
  where: { userId: parseInt(userId) }, // Convert string to number
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    verificationCode: true,
    batchIds: true,
    certificationDate: true,
    totalCertified: true,
    certificationType: true,
    expiryDate: true,
    totalJars: true,
    createdAt: true
  }
});

    return certifications.map(cert => ({
      ...cert,
      batchIds: cert.batchIds.split(','),
      certificationDate: cert.certificationDate.toISOString().split('T')[0],
      expiryDate: cert.expiryDate.toISOString().split('T')[0],
      totalCertified: cert.totalCertified.toString(),
      createdAt: cert.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    throw error;
  }
}
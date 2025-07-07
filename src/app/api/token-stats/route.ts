import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const tokenStats = await prisma.tokenStats.findUnique({
      where: { userId: Number(userId) }
    });

    return res.status(200).json(tokenStats || {
      totalTokens: 0,
      remainingTokens: 0,
      originOnly: 0,
      qualityOnly: 0,
      bothCertifications: 0
    });
  } catch (error) {
    console.error('Error fetching token stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
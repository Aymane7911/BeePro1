import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

// =======================
// ✅ POST: Add tokens to user's balance
// =======================
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🚀 [${requestId}] POST /api/token-stats/add-tokens - Starting request`);

  try {
    console.log(`🔐 [${requestId}] Authenticating request...`);
    const authResult = await authenticateRequest(request);
    const userId = typeof authResult === 'string' ? authResult : authResult?.userId;

    if (!userId) {
      console.log(`❌ [${requestId}] Authentication failed`);
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      console.log(`❌ [${requestId}] Invalid user ID format`);
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    console.log(`✅ [${requestId}] User authenticated: ${userIdInt}`);

    const body = await request.json();
    console.log(`📥 [${requestId}] Request body:`, body);

    const tokensToAddInt = parseInt(String(body.tokensToAdd || 0), 10);
    if (tokensToAddInt <= 0) {
      console.log(`❌ [${requestId}] Invalid tokens amount: ${tokensToAddInt}`);
      return NextResponse.json({ error: "Tokens to add must be greater than 0" }, { status: 400 });
    }

    console.log(`📊 [${requestId}] Adding ${tokensToAddInt} tokens to user ${userIdInt}`);

    // Check if user already has token stats
    let updatedTokenStats;
    const existingStats = await prisma.tokenStats.findUnique({ where: { userId: userIdInt } });

    if (existingStats) {
      updatedTokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: {
          totalTokens: existingStats.totalTokens + tokensToAddInt,
          remainingTokens: existingStats.remainingTokens + tokensToAddInt,
        },
      });

      console.log(`📊 [${requestId}] Updated existing stats:`,
        `Total=${updatedTokenStats.totalTokens}, Remaining=${updatedTokenStats.remainingTokens}`
      );
    } else {
      updatedTokenStats = await prisma.tokenStats.create({
        data: {
          userId: userIdInt,
          totalTokens: tokensToAddInt,
          remainingTokens: tokensToAddInt,
          originOnly: 0,
          qualityOnly: 0,
          bothCertifications: 0,
          databaseId: body.databaseId,
        },
      });

      console.log(`📊 [${requestId}] Created new stats for user:`, updatedTokenStats);
    }

    // Verification: auto-correct remaining if mismatch
    const usedTokens = updatedTokenStats.originOnly + updatedTokenStats.qualityOnly + updatedTokenStats.bothCertifications;
    const expectedRemaining = updatedTokenStats.totalTokens - usedTokens;

    if (expectedRemaining !== updatedTokenStats.remainingTokens) {
      console.warn(`⚠️ [${requestId}] Token mismatch: expected=${expectedRemaining}, actual=${updatedTokenStats.remainingTokens}`);
      updatedTokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: { remainingTokens: expectedRemaining },
      });
      console.log(`🔧 [${requestId}] Auto-corrected remaining to ${expectedRemaining}`);
    }

    console.log(`✅ [${requestId}] Final stats:`, updatedTokenStats);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${tokensToAddInt} tokens`,
      tokenStats: {
        ...updatedTokenStats,
        usedTokens,
      },
    });

  } catch (error: any) {
    console.error(`❌ [${requestId}] FATAL ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to add tokens", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log(`🏁 [${requestId}] Request completed`);
  }
}

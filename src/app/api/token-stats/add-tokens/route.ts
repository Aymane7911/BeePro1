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
    if (!authResult || typeof authResult !== 'object') {
      console.log(`❌ [${requestId}] Authentication failed`);
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { userId: userIdStr, databaseId } = authResult;
    const userIdInt = parseInt(userIdStr, 10);
    if (isNaN(userIdInt)) {
      console.log(`❌ [${requestId}] Invalid user ID format: ${userIdStr}`);
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }
    console.log(`✅ [${requestId}] User authenticated: ${userIdInt}`);

    const body = await request.json();
    console.log(`📥 [${requestId}] Request body:`, body);

    const tokensToAdd = parseInt(String(body.tokensToAdd || 0), 10);
    if (tokensToAdd <= 0) {
      console.log(`❌ [${requestId}] Invalid tokens amount: ${tokensToAdd}`);
      return NextResponse.json({ error: "Tokens to add must be greater than 0" }, { status: 400 });
    }
    console.log(`📊 [${requestId}] Adding ${tokensToAdd} tokens to user ${userIdInt}`);

    // Find or create tokenStats
    let tokenStats = await prisma.tokenStats.findUnique({ where: { userId: userIdInt } });
    if (tokenStats) {
      tokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: {
          totalTokens: tokenStats.totalTokens + tokensToAdd,
          remainingTokens: tokenStats.remainingTokens + tokensToAdd,
        },
      });
      console.log(`📊 [${requestId}] Updated stats: Total=${tokenStats.totalTokens}, Remaining=${tokenStats.remainingTokens}`);
    } else {
      tokenStats = await prisma.tokenStats.create({
        data: {
          userId: userIdInt,
          totalTokens: tokensToAdd,
          remainingTokens: tokensToAdd,
          originOnly: 0,
          qualityOnly: 0,
          bothCertifications: 0,
          databaseId: databaseId,
        },
      });
      console.log(`📊 [${requestId}] Created stats:`, tokenStats);
    }

    // Auto-correct remaining tokens if mismatch
    const usedTokens = tokenStats.originOnly + tokenStats.qualityOnly + tokenStats.bothCertifications;
    const expectedRemaining = tokenStats.totalTokens - usedTokens;
    if (expectedRemaining !== tokenStats.remainingTokens) {
      console.warn(`⚠️ [${requestId}] Remaining mismatch: expected=${expectedRemaining}, actual=${tokenStats.remainingTokens}`);
      tokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: { remainingTokens: expectedRemaining },
      });
      console.log(`🔧 [${requestId}] Corrected remaining to ${expectedRemaining}`);
    }

    console.log(`✅ [${requestId}] Final stats:`, tokenStats);
    return NextResponse.json({
      success: true,
      message: `Successfully added ${tokensToAdd} tokens`,
      tokenStats: { ...tokenStats, usedTokens },
    });

  } catch (error: any) {
    console.error(`❌ [${requestId}] FATAL ERROR:`, error);
    return NextResponse.json({ error: "Failed to add tokens", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log(`🏁 [${requestId}] Request completed`);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

// =======================
// ✅ POST: Add tokens to user's balance
// =======================
export async function POST(request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🚀 [${requestId}] POST /api/token-stats/add-tokens - Starting request`);

  try {
    console.log(`🔐 [${requestId}] Authenticating request...`);
    const userId = await authenticateRequest(request);

    if (!userId) {
      console.log(`❌ [${requestId}] Authentication failed`);
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      console.log(`❌ [${requestId}] Invalid user ID format`);
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    console.log(`✅ [${requestId}] User authenticated: ${userIdInt}`);

    const body = await request.json();
    console.log(`📥 [${requestId}] Request body:`, body);

    const { tokensToAdd } = body;
    const tokensToAddInt = parseInt(String(tokensToAdd || 0), 10);

    if (tokensToAddInt <= 0) {
      console.log(`❌ [${requestId}] Invalid tokens amount: ${tokensToAddInt}`);
      return NextResponse.json({ error: "Tokens to add must be greater than 0" }, { status: 400 });
    }

    console.log(`📊 [${requestId}] Adding ${tokensToAddInt} tokens to user ${userIdInt}`);

    // Check if user already has token stats
    const existingStats = await prisma.tokenStats.findUnique({
      where: { userId: userIdInt }
    });

    let updatedTokenStats;

    if (existingStats) {
      // ✅ Update existing token stats - add to both total and remaining
      updatedTokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: {
          totalTokens: existingStats.totalTokens + tokensToAddInt,
          remainingTokens: existingStats.remainingTokens + tokensToAddInt
        }
      });

      console.log(`📊 [${requestId}] Updated existing stats: 
        Total tokens: ${existingStats.totalTokens} + ${tokensToAddInt} = ${updatedTokenStats.totalTokens}
        Remaining tokens: ${existingStats.remainingTokens} + ${tokensToAddInt} = ${updatedTokenStats.remainingTokens}`);

    } else {
      // ✅ Create new token stats for first-time user
      updatedTokenStats = await prisma.tokenStats.create({
        data: {
          userId: userIdInt,
          totalTokens: tokensToAddInt,
          remainingTokens: tokensToAddInt,
          originOnly: 0,
          qualityOnly: 0,
          bothCertifications: 0
        }
      });

      console.log(`📊 [${requestId}] Created new stats for user:`, updatedTokenStats);
    }

    // ✅ Verification: Check if the math adds up
    const usedTokens = updatedTokenStats.originOnly + updatedTokenStats.qualityOnly + updatedTokenStats.bothCertifications;
    const expectedRemaining = updatedTokenStats.totalTokens - usedTokens;

    if (expectedRemaining !== updatedTokenStats.remainingTokens) {
      console.warn(`⚠️ [${requestId}] Token math mismatch: expected=${expectedRemaining}, actual=${updatedTokenStats.remainingTokens}`);
      
      // Auto-correct the remaining tokens
      updatedTokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: {
          remainingTokens: expectedRemaining
        }
      });
      
      console.log(`🔧 [${requestId}] Auto-corrected remaining tokens to: ${expectedRemaining}`);
    }

    console.log(`✅ [${requestId}] Successfully added ${tokensToAddInt} tokens - Final stats:`, {
      totalTokens: updatedTokenStats.totalTokens,
      remainingTokens: updatedTokenStats.remainingTokens,
      originOnly: updatedTokenStats.originOnly,
      qualityOnly: updatedTokenStats.qualityOnly,
      bothCertifications: updatedTokenStats.bothCertifications,
      usedTokens: usedTokens
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${tokensToAddInt} tokens`,
      tokenStats: {
        id: updatedTokenStats.id,
        userId: updatedTokenStats.userId,
        totalTokens: updatedTokenStats.totalTokens,
        remainingTokens: updatedTokenStats.remainingTokens,
        originOnly: updatedTokenStats.originOnly,
        qualityOnly: updatedTokenStats.qualityOnly,
        bothCertifications: updatedTokenStats.bothCertifications,
        usedTokens: usedTokens
      }
    });

  } catch (error) {
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
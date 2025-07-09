import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

// =======================
// ✅ GET: Fetch token stats
// =======================
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🚀 [${requestId}] GET /api/token-stats/update - Starting request`);

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

    const tokenStats = await prisma.tokenStats.findUnique({
      where: { userId: userIdInt }
    });

    if (!tokenStats) {
      console.log(`📊 [${requestId}] No token stats found, returning defaults`);
      return NextResponse.json({
        userId: userIdInt,
        totalTokens: 0,
        remainingTokens: 0,
        originOnly: 0,
        qualityOnly: 0,
        bothCertifications: 0,
        usedTokens: 0
      });
    }

    const usedTokens = tokenStats.originOnly + tokenStats.qualityOnly + tokenStats.bothCertifications;
    const expectedRemaining = tokenStats.totalTokens - usedTokens;

    if (expectedRemaining !== tokenStats.remainingTokens) {
      console.warn(`⚠️ [${requestId}] Mismatch: expectedRemaining = ${expectedRemaining}, actual = ${tokenStats.remainingTokens}`);
    }

    console.log(`✅ [${requestId}] GET completed`);
    return NextResponse.json({
      id: tokenStats.id,
      userId: tokenStats.userId,
      totalTokens: tokenStats.totalTokens,
      remainingTokens: tokenStats.remainingTokens,
      originOnly: tokenStats.originOnly,
      qualityOnly: tokenStats.qualityOnly,
      bothCertifications: tokenStats.bothCertifications,
      usedTokens: usedTokens
    });

  } catch (error) {
    console.error(`❌ [${requestId}] FATAL GET ERROR:`, error);
    return NextResponse.json(
      { error: "Failed to fetch token stats", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log(`🏁 [${requestId}] GET request completed`);
  }
}

// =======================
// ✅ POST: Update token stats using actual token balance
// =======================
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🚀 [${requestId}] POST /api/token-stats/update - Starting request`);

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
    console.log(`📥 [${requestId}] Raw body:`, body);

    const { originOnly, qualityOnly, bothCertifications, tokensUsed } = body;

    const originOnlyInt = parseInt(String(originOnly || 0), 10) || 0;
    const qualityOnlyInt = parseInt(String(qualityOnly || 0), 10) || 0;
    const bothCertificationsInt = parseInt(String(bothCertifications || 0), 10) || 0;
    const tokensUsedInt = parseInt(String(tokensUsed || 0), 10) || 0;

    const safeOriginOnly = Math.max(0, originOnlyInt);
    const safeQualityOnly = Math.max(0, qualityOnlyInt);
    const safeBothCertifications = Math.max(0, bothCertificationsInt);
    const safeTokensUsed = Math.max(0, tokensUsedInt);

    // ✅ Validate that breakdown matches total
    const totalCertificationTokens = safeOriginOnly + safeQualityOnly + safeBothCertifications;
    if (safeTokensUsed !== totalCertificationTokens) {
      console.log(`❌ [${requestId}] Token mismatch: used=${safeTokensUsed}, breakdown sum=${totalCertificationTokens}`);
      return NextResponse.json(
        { error: `Token mismatch: used=${safeTokensUsed} != breakdown sum=${totalCertificationTokens}` },
        { status: 400 }
      );
    }

    console.log(`📊 [${requestId}] Token breakdown validated: Origin=${safeOriginOnly}, Quality=${safeQualityOnly}, Both=${safeBothCertifications}, Total=${safeTokensUsed}`);

    // ✅ FIXED: Get current token balance from database or user's actual balance
    const existingStats = await prisma.tokenStats.findUnique({
      where: { userId: userIdInt }
    });

    let updatedTokenStats;

    if (existingStats) {
      // ✅ FIXED: Use actual remaining tokens from database
      const currentRemainingTokens = existingStats.remainingTokens;
      
      // Check if user has enough tokens for this certification
      if (currentRemainingTokens < safeTokensUsed) {
        console.log(`❌ [${requestId}] Insufficient tokens: available=${currentRemainingTokens}, needed=${safeTokensUsed}`);
        return NextResponse.json(
          { error: `Insufficient tokens. Available=${currentRemainingTokens}, Needed=${safeTokensUsed}` },
          { status: 400 }
        );
      }

      // ✅ FIXED: Update stats and deduct tokens from remaining balance
      updatedTokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: {
          originOnly: existingStats.originOnly + safeOriginOnly,
          qualityOnly: existingStats.qualityOnly + safeQualityOnly,
          bothCertifications: existingStats.bothCertifications + safeBothCertifications,
          remainingTokens: currentRemainingTokens - safeTokensUsed
        }
      });

      console.log(`📊 [${requestId}] Updated existing stats: 
        Origin: ${existingStats.originOnly} + ${safeOriginOnly} = ${updatedTokenStats.originOnly}
        Quality: ${existingStats.qualityOnly} + ${safeQualityOnly} = ${updatedTokenStats.qualityOnly}
        Both: ${existingStats.bothCertifications} + ${safeBothCertifications} = ${updatedTokenStats.bothCertifications}
        Remaining: ${currentRemainingTokens} - ${safeTokensUsed} = ${updatedTokenStats.remainingTokens}`);

    } else {
      // ✅ FIXED: For new users, you need to fetch their actual token balance
      // This should come from your user's token balance table or system
      // For now, I'll assume you have a way to get the user's purchased token balance
      
      // You might need to query a separate TokenBalance table or User table
      // const userTokenBalance = await prisma.user.findUnique({
      //   where: { id: userIdInt },
      //   select: { tokenBalance: true }
      // });
      
      // For now, I'll use a placeholder - replace this with actual token balance query
      const actualTokenBalance = 2299; // Replace with actual query to get user's token balance
      
      if (actualTokenBalance < safeTokensUsed) {
        console.log(`❌ [${requestId}] Insufficient tokens for new user: available=${actualTokenBalance}, needed=${safeTokensUsed}`);
        return NextResponse.json(
          { error: `Insufficient tokens. Available=${actualTokenBalance}, Needed=${safeTokensUsed}` },
          { status: 400 }
        );
      }

      // ✅ FIXED: Create new stats with actual token balance
      updatedTokenStats = await prisma.tokenStats.create({
        data: {
          userId: userIdInt,
          totalTokens: actualTokenBalance,
          remainingTokens: actualTokenBalance - safeTokensUsed,
          originOnly: safeOriginOnly,
          qualityOnly: safeQualityOnly,
          bothCertifications: safeBothCertifications
        }
      });

      console.log(`📊 [${requestId}] Created new stats for user with actual token balance: ${JSON.stringify(updatedTokenStats)}`);
    }

    // ✅ Verification: Check if the math adds up
    const usedTokens = updatedTokenStats.originOnly + updatedTokenStats.qualityOnly + updatedTokenStats.bothCertifications;
    const expectedRemaining = updatedTokenStats.totalTokens - usedTokens;

    if (expectedRemaining !== updatedTokenStats.remainingTokens) {
      console.warn(`⚠️ [${requestId}] Post-update mismatch: expected=${expectedRemaining}, actual=${updatedTokenStats.remainingTokens}`);
      
      // ✅ FIXED: Auto-correct the remaining tokens if there's a mismatch
      updatedTokenStats = await prisma.tokenStats.update({
        where: { userId: userIdInt },
        data: {
          remainingTokens: expectedRemaining
        }
      });
      
      console.log(`🔧 [${requestId}] Auto-corrected remaining tokens to: ${expectedRemaining}`);
    }

    console.log(`✅ [${requestId}] POST completed successfully - Final stats:`, {
      originOnly: updatedTokenStats.originOnly,
      qualityOnly: updatedTokenStats.qualityOnly,
      bothCertifications: updatedTokenStats.bothCertifications,
      totalUsed: usedTokens,
      remainingTokens: updatedTokenStats.remainingTokens,
      totalTokens: updatedTokenStats.totalTokens
    });

    return NextResponse.json({
      id: updatedTokenStats.id,
      userId: updatedTokenStats.userId,
      totalTokens: updatedTokenStats.totalTokens,
      remainingTokens: updatedTokenStats.remainingTokens,
      originOnly: updatedTokenStats.originOnly,
      qualityOnly: updatedTokenStats.qualityOnly,
      bothCertifications: updatedTokenStats.bothCertifications,
      usedTokens: usedTokens
    });

  } catch (error) {
    console.error(`❌ [${requestId}] FATAL POST ERROR:`, error);
    return NextResponse.json({ error: "Failed to update token stats", details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
    console.log(`🏁 [${requestId}] POST request completed`);
  }
}
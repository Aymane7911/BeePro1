import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
        
    if (!userId) {
      console.warn('[GET /api/batches] ▶ No authenticated user found');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userIdInt = parseInt(userId);
        
    if (isNaN(userIdInt)) {
      console.error('[GET /api/batches] ▶ Invalid user ID format:', userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const batches = await prisma.batch.findMany({
      where: {
        userId: userIdInt,
      },
      include: {
        apiaries: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[GET /api/batches] ▶ Found ${batches.length} batches for user ${userIdInt}`);

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("[GET /api/batches] ▶ Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
             
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
 
    const userIdInt = parseInt(userId);
             
    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
      
    const body = await request.json();
    const { apiaries, ...batchData } = body;
 
    const parseCoordinate = (value: any): number | null => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
             
      const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
             
      if (isNaN(parsed) || (parsed === 0)) {
        return null;
      }
             
      return parsed;
    };
 
    const batch = await prisma.batch.create({
      data: {
        ...batchData,
        weightKg: parseFloat(batchData.weightKg) || 0, // This is the total honey collected
        userId: userIdInt,
        // Initialize honey tracking fields
        totalHoneyCollected: parseFloat(batchData.weightKg) || 0, // Same as weightKg for consistency
        honeyCertified: 0, // No honey certified initially
        honeyRemaining: parseFloat(batchData.weightKg) || 0, // All honey is remaining initially
        apiaries: {
          create: apiaries?.map((apiary: any) => ({
            name: apiary.name || '',
            number: apiary.number || '',
            hiveCount: parseInt(apiary.hiveCount) || 0,
            kilosCollected: parseFloat(apiary.kilosCollected) || 0,
            latitude: parseCoordinate(apiary.latitude),
            longitude: parseCoordinate(apiary.longitude),
            userId: userIdInt, // Add userId for apiary
          })) || []
        }
      },
      include: {
        apiaries: true,
      },
    });
 
    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("[POST /api/batches] ▶ Error:", error);
    return NextResponse.json(
      { error: "Failed to create batch" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication - get userId and convert to number
    const userIdString = await authenticateRequest(request);
    if (!userIdString) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = parseInt(userIdString);
    
    const formData = await request.formData();
    const data = JSON.parse(formData.get('data') as string);
    const { batchId, updatedFields, apiaries, batchJars, jarCertifications } = data;

    // Handle file uploads (production report and lab report)
    let productionReportPath = null;
    let labReportPath = null;

    if (formData.get('productionReport')) {
      // Handle production report file upload
      productionReportPath = "public/uploads/production_report"; // Replace with actual saved path
    }

    if (formData.get('labReport')) {
      // Handle lab report file upload
      labReportPath = "public/uploads/lab_report"; // Replace with actual saved path
    }

    // Get the original batch to understand current state
    const originalBatch = await prisma.batch.findUnique({
      where: { id: batchId },
      select: { 
        weightKg: true, // This is the total honey collected
        totalHoneyCollected: true,
        honeyCertified: true,
        honeyRemaining: true
      }
    });

    if (!originalBatch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Calculate honey amounts correctly using weightKg as the source of truth
    let totalHoneyCertifiedInThisSession = 0;
    let totalJarsUsed = 0;

    if (batchJars && batchJars.length > 0) {
      totalHoneyCertifiedInThisSession = batchJars.reduce((sum: number, jar: any) => {
        return sum + (jar.size * jar.quantity / 1000); // Convert grams to kg
      }, 0);
      
      totalJarsUsed = batchJars.reduce((sum: number, jar: any) => sum + jar.quantity, 0);
    }

    // Use weightKg as the definitive source for total honey collected
    const totalHoneyCollected = originalBatch.weightKg || originalBatch.totalHoneyCollected || 0;

    // Calculate cumulative certified amount
    const previousTotalCertified = originalBatch.honeyCertified || 0;
    const newTotalCertified = previousTotalCertified + totalHoneyCertifiedInThisSession;

    // Calculate remaining honey after this certification
    const newHoneyRemaining = Math.max(0, totalHoneyCollected - newTotalCertified);

    // Calculate certification breakdowns from batchJars
    let originOnly = 0;
    let qualityOnly = 0;
    let bothCertifications = 0;

    if (batchJars && jarCertifications) {
      batchJars.forEach((jar: any) => {
        const jarTotalWeight = (jar.size * jar.quantity) / 1000; // Convert to kg
        const certification = jarCertifications[jar.id];

        if (certification) {
          if (certification.origin && certification.quality) {
            bothCertifications += jarTotalWeight;
          } else if (certification.origin && !certification.quality) {
            originOnly += jarTotalWeight;
          } else if (!certification.origin && certification.quality) {
            qualityOnly += jarTotalWeight;
          }
        }
      });
    }

    // Calculate percentages based on the total honey collected (weightKg)
    const originOnlyPercent = totalHoneyCollected > 0 ? Math.round((originOnly / totalHoneyCollected) * 100) : 0;
    const qualityOnlyPercent = totalHoneyCollected > 0 ? Math.round((qualityOnly / totalHoneyCollected) * 100) : 0;
    const bothCertificationsPercent = totalHoneyCollected > 0 ? Math.round((bothCertifications / totalHoneyCollected) * 100) : 0;
    const uncertifiedPercent = totalHoneyCollected > 0 ? Math.round((newHoneyRemaining / totalHoneyCollected) * 100) : 0;

    // Update the batch with correct values
    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: {
        status: updatedFields.status,
        jarCertifications: updatedFields.jarCertifications,
        certificationDate: updatedFields.certificationDate,
        expiryDate: updatedFields.expiryDate,
        completedChecks: updatedFields.completedChecks,
        totalChecks: updatedFields.totalChecks,
        
        // Keep weightKg as the definitive total honey collected (never changes after creation)
        // Don't update weightKg here as it represents the original honey collected
        
        // Store honey tracking amounts correctly
        totalHoneyCollected: totalHoneyCollected, // Keep consistent with weightKg
        honeyCertified: newTotalCertified, // Cumulative certified amount
        honeyRemaining: newHoneyRemaining, // Remaining honey after this certification
        
        // Store certification breakdowns
        originOnly: originOnly,
        qualityOnly: qualityOnly,
        bothCertifications: bothCertifications,
        uncertified: newHoneyRemaining, // Remaining honey is considered uncertified
        
        // Store percentages
        originOnlyPercent: originOnlyPercent,
        qualityOnlyPercent: qualityOnlyPercent,
        bothCertificationsPercent: bothCertificationsPercent,
        uncertifiedPercent: uncertifiedPercent,
        
        // Store jar information
        jarsUsed: totalJarsUsed,
        // Note: weightKg represents total honey collected, not honey certified in this session
        
        // Store file paths
        productionReportPath: productionReportPath,
        labReportPath: labReportPath,
        updatedAt: new Date()
      }
    });

    // Update associated apiaries with proper null checks and defaults
    if (apiaries && apiaries.length > 0) {
      for (const apiaryData of apiaries) {
        // Find the apiary by name and number
        const existingApiary = await prisma.apiary.findFirst({
          where: {
            name: apiaryData.name,
            number: apiaryData.number,
            batchId: batchId
          }
        });

        if (existingApiary) {
          // Update existing apiary with proper null checks
          await prisma.apiary.update({
            where: { id: existingApiary.id },
            data: {
              hiveCount: apiaryData.hiveCount || 0,
              latitude: apiaryData.latitude || null,
              longitude: apiaryData.longitude || null,
              kilosCollected: apiaryData.kilosCollected || 0, // This should be the remaining amount
            }
          });
        } else {
          // Create new apiary with proper user and batch relationships
          await prisma.apiary.create({
            data: {
              name: apiaryData.name || '',
              number: apiaryData.number || '',
              hiveCount: apiaryData.hiveCount || 0,
              latitude: apiaryData.latitude != null && apiaryData.latitude !== '' && !isNaN(parseFloat(apiaryData.latitude))
                ? parseFloat(apiaryData.latitude)
                : 0.0, // Default latitude if not provided
              longitude: apiaryData.longitude != null && apiaryData.longitude !== '' && !isNaN(parseFloat(apiaryData.longitude))
                ? parseFloat(apiaryData.longitude)
                : 0.0, // Default longitude if not provided
              kilosCollected: apiaryData.kilosCollected || 0,
              batch: {
                connect: { id: batchId } // Connect to batch using relation
              },
              user: {
                connect: { id: userId }
              }
            }
          });
        }
      }
    }

    // ✅ REMOVED: No more automatic token stats update from batch API
    // Token stats should be updated separately by your frontend or dedicated service
    // This prevents the duplicate token charging issue

    console.log('Batch completion summary:', {
      batchId,
      totalHoneyCollected, // From weightKg
      totalHoneyCertifiedInThisSession,
      newTotalCertified,
      newHoneyRemaining,
      originOnly,
      qualityOnly,
      bothCertifications,
      totalJarsUsed,
      // Note: Token stats are NOT updated here to prevent duplicate charges
      tokenStatsNote: 'Token stats should be updated separately by frontend'
    });

    return NextResponse.json({
      success: true,
      message: 'Batch completed successfully',
      batch: updatedBatch,
      summary: {
        totalHoneyCollected, // From weightKg
        honeyCertifiedThisSession: totalHoneyCertifiedInThisSession,
        totalHoneyCertified: newTotalCertified,
        honeyRemaining: newHoneyRemaining,
        jarsUsed: totalJarsUsed,
        certificationBreakdown: {
          originOnly,
          qualityOnly,
          bothCertifications,
          uncertified: newHoneyRemaining
        }
      }
    });

  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
        
    if (!userId) {
      console.warn('[DELETE /api/batches] ▶ No authenticated user found');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userIdInt = parseInt(userId);
        
    if (isNaN(userIdInt)) {
      console.error('[DELETE /api/batches] ▶ Invalid user ID format:', userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Extract batchId from URL parameters
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    
    if (!batchId) {
      console.error('[DELETE /api/batches] ▶ No batch ID provided');
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      );
    }

    console.log(`[DELETE /api/batches] ▶ Attempting to delete batch: ${batchId} for user: ${userIdInt}`);

    // Verify the batch exists and belongs to the authenticated user
    const existingBatch = await prisma.batch.findFirst({
      where: {
        id: batchId,
        userId: userIdInt,
      },
      include: {
        apiaries: true,
      },
    });

    if (!existingBatch) {
      console.warn(`[DELETE /api/batches] ▶ Batch not found or access denied: ${batchId}`);
      return NextResponse.json(
        { error: "Batch not found or access denied" },
        { status: 404 }
      );
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // First, unlink apiaries from this batch (preserve the apiary locations)
      // Set batchId to null instead of deleting the apiaries
      await tx.apiary.updateMany({
        where: {
          batchId: batchId,
        },
        data: {
          batchId: null, // Remove the batch association but keep the apiary
        },
      });

      // Then delete the batch itself
      await tx.batch.delete({
        where: {
          id: batchId,
        },
      });
    });

    console.log(`[DELETE /api/batches] ▶ Successfully deleted batch: ${batchId} and unlinked ${existingBatch.apiaries.length} apiaries (preserved locations)`);

    return NextResponse.json(
      { 
        message: "Batch deleted successfully. Apiary locations have been preserved.",
        deletedBatch: {
          id: batchId,
          batchNumber: existingBatch.batchNumber,
          unlinkedApiariesCount: existingBatch.apiaries.length
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[DELETE /api/batches] ▶ Error:", error);
    return NextResponse.json(
      { error: "Failed to delete batch" },
      { status: 500 }
    );
  }
}
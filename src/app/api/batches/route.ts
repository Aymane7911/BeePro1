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
        weightKg: parseFloat(batchData.weightKg) || 0, // Ensure weightKg is properly parsed
        userId: userIdInt,
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
<<<<<<< HEAD
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
      // ... your existing file upload logic ...
      productionReportPath = "path/to/saved/production/report"; // Replace with actual saved path
    }

    if (formData.get('labReport')) {
      // Handle lab report file upload
      // ... your existing file upload logic ...
      labReportPath = "path/to/saved/lab/report"; // Replace with actual saved path
    }

    // For batch-based approach, get the total certified amount from batchJars
    let totalHoneyCertified = 0;
    let totalJarsUsed = 0;

    if (batchJars && batchJars.length > 0) {
      totalHoneyCertified = batchJars.reduce((sum: number, jar: any) => {
        return sum + (jar.size * jar.quantity / 1000); // Convert grams to kg
      }, 0);
      
      totalJarsUsed = batchJars.reduce((sum: number, jar: any) => sum + jar.quantity, 0);
    }

    // Get the original batch to know the total honey collected
    const originalBatch = await prisma.batch.findUnique({
      where: { id: batchId },
      select: { totalHoneyCollected: true }
    });

    const totalHoneyCollected = originalBatch?.totalHoneyCollected || 0;
    const totalHoneyRemaining = Math.max(0, totalHoneyCollected - totalHoneyCertified);

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

    // Calculate percentages
    const originOnlyPercent = totalHoneyCertified > 0 ? Math.round((originOnly / totalHoneyCertified) * 100) : 0;
    const qualityOnlyPercent = totalHoneyCertified > 0 ? Math.round((qualityOnly / totalHoneyCertified) * 100) : 0;
    const bothCertificationsPercent = totalHoneyCertified > 0 ? Math.round((bothCertifications / totalHoneyCertified) * 100) : 0;
    const uncertifiedPercent = 100 - originOnlyPercent - qualityOnlyPercent - bothCertificationsPercent;

    // Update the batch with the new fields
    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: {
        status: updatedFields.status,
        jarCertifications: updatedFields.jarCertifications,
        certificationDate: updatedFields.certificationDate,
        expiryDate: updatedFields.expiryDate,
        completedChecks: updatedFields.completedChecks,
        totalChecks: updatedFields.totalChecks,
        
        // Store the calculated honey values
        honeyCertified: totalHoneyCertified,
        honeyRemaining: totalHoneyRemaining,
        totalHoneyCollected: totalHoneyCollected,
        
        // Store certification breakdowns
        originOnly: originOnly,
        qualityOnly: qualityOnly,
        bothCertifications: bothCertifications,
        uncertified: totalHoneyRemaining, // Remaining honey is considered uncertified
        
        // Store percentages
        originOnlyPercent: originOnlyPercent,
        qualityOnlyPercent: qualityOnlyPercent,
        bothCertificationsPercent: bothCertificationsPercent,
        uncertifiedPercent: uncertifiedPercent,
        
        // Store jar information
        jarsUsed: totalJarsUsed,
        weightKg: totalHoneyCertified, // Total weight of certified honey
        
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
              kilosCollected: apiaryData.kilosCollected || 0, // Ensure it's never null
            }
          });
        } else {
          // Create new apiary if it doesn't exist
          await prisma.apiary.create({
            data: {
              name: apiaryData.name || '',
              number: apiaryData.number || '',
              hiveCount: apiaryData.hiveCount || 0,
              latitude: apiaryData.latitude || null,
              longitude: apiaryData.longitude || null,
              kilosCollected: apiaryData.kilosCollected || 0,
              batchId: batchId,
              userId: userId
            }
          });
        }
      }
    }

    console.log('Batch completion summary:', {
      batchId,
      totalHoneyCollected,
      totalHoneyCertified,
      totalHoneyRemaining,
      originOnly,
      qualityOnly,
      bothCertifications,
      totalJarsUsed
    });

    return NextResponse.json({
      success: true,
      message: 'Batch completed successfully',
      batch: updatedBatch,
      summary: {
        totalHoneyCollected,
        honeyCertified: totalHoneyCertified,
        honeyRemaining: totalHoneyRemaining,
        jarsUsed: totalJarsUsed,
        certificationBreakdown: {
          originOnly,
          qualityOnly,
          bothCertifications,
          uncertified: totalHoneyRemaining
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

// ADD THIS DELETE METHOD
export async function DELETE(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
        
    if (!userId) {
      console.warn('[DELETE /api/batches] ▶ No authenticated user found');
=======
    const userId = await authenticateRequest(request);
        
    if (!userId) {
      console.warn('[PUT /api/batches] ▶ No authenticated user found');
>>>>>>> bc4b0064770fda7b4a3ad525998222858d435f08
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userIdInt = parseInt(userId);
        
    if (isNaN(userIdInt)) {
<<<<<<< HEAD
      console.error('[DELETE /api/batches] ▶ Invalid user ID format:', userId);
=======
      console.error('[PUT /api/batches] ▶ Invalid user ID format:', userId);
>>>>>>> bc4b0064770fda7b4a3ad525998222858d435f08
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Extract batchId from URL parameters
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    
    if (!batchId) {
      console.error('[DELETE /api/batches] ▶ No batch ID provided');
      return NextResponse.json(
        { error: "Batch ID is required" },
=======
    const formData = await request.formData();
    const dataString = formData.get('data') as string;
    
    if (!dataString) {
      return NextResponse.json(
        { error: "No data provided" },
>>>>>>> bc4b0064770fda7b4a3ad525998222858d435f08
        { status: 400 }
      );
    }

<<<<<<< HEAD
    console.log(`[DELETE /api/batches] ▶ Attempting to delete batch: ${batchId} for user: ${userIdInt}`);

    // Verify the batch exists and belongs to the authenticated user
=======
    const data = JSON.parse(dataString);
    const { batchId, updatedFields, apiaries } = data;

    console.log('[PUT /api/batches] ▶ Updating batch:', batchId);

    const parseCoordinate = (value: any): number | null => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
      
      if (isNaN(parsed) || parsed === 0) {
        return null;
      }
      
      return parsed;
    };

    // Verify the batch belongs to the authenticated user
>>>>>>> bc4b0064770fda7b4a3ad525998222858d435f08
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
<<<<<<< HEAD
      console.warn(`[DELETE /api/batches] ▶ Batch not found or access denied: ${batchId}`);
=======
>>>>>>> bc4b0064770fda7b4a3ad525998222858d435f08
      return NextResponse.json(
        { error: "Batch not found or access denied" },
        { status: 404 }
      );
    }

<<<<<<< HEAD
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
=======
    // Prepare update data - convert jarCertifications to proper JSON
    const updateData: any = { ...updatedFields };
    if (updatedFields.jarCertifications) {
      updateData.jarCertifications = updatedFields.jarCertifications;
    }

    // Update the batch
    const updatedBatch = await prisma.batch.update({
      where: {
        id: batchId,
      },
      data: updateData,
      include: {
        apiaries: true,
      },
    });

    // Update apiaries if provided
    if (apiaries && apiaries.length > 0) {
      // Delete existing apiaries for this batch
      await prisma.apiary.deleteMany({
        where: {
          batchId: batchId,
        },
      });

      // Create new apiaries with updated data
      const processedApiaries = apiaries.map((apiary: any) => ({
        name: apiary.name || '',
        number: apiary.number || '',
        hiveCount: parseInt(apiary.hiveCount) || 0,
        kilosCollected: parseFloat(apiary.kilosCollected) || 0,
        latitude: parseCoordinate(apiary.latitude),
        longitude: parseCoordinate(apiary.longitude),
        batchId: batchId,
        userId: userIdInt, // Add userId for apiary
      }));

      await prisma.apiary.createMany({
        data: processedApiaries,
      });
    }

    // Fetch the updated batch with new apiaries
    const finalBatch = await prisma.batch.findUnique({
      where: {
        id: batchId,
      },
      include: {
        apiaries: true,
      },
    });

    console.log('[PUT /api/batches] ▶ Successfully updated batch:', batchId);

    return NextResponse.json({ 
      message: "Batch updated successfully", 
      batch: finalBatch 
    });

  } catch (error) {
    console.error("[PUT /api/batches] ▶ Error:", error);
    return NextResponse.json(
      { error: "Failed to update batch" },
>>>>>>> bc4b0064770fda7b4a3ad525998222858d435f08
      { status: 500 }
    );
  }
}
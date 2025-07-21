// src/app/api/apiaries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

interface UpdateApiaryBody {
  hiveCount?: number;
  name?: string;
  number?: string;
  latitude?: number;
  longitude?: number;
  kilosCollected?: number;
}

// PATCH handler – update a specific apiary
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  let apiaryId: number;
  
  // Await params before using
  const { id } = await params;
  
  console.log(`[PATCH /api/apiaries/${id}] ▶ Request started at ${new Date().toISOString()}`);
  console.log(`[PATCH /api/apiaries/${id}] ▶ Request headers:`, Object.fromEntries(request.headers.entries()));
  console.log(`[PATCH /api/apiaries/${id}] ▶ Request URL:`, request.url);
  
  try {
    console.log(`[PATCH /api/apiaries/${id}] ▶ Starting authentication...`);
    // Get the authenticated user ID
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      console.warn(`[PATCH /api/apiaries/${id}] ▶ Authentication failed - no user ID returned`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.log(`[PATCH /api/apiaries/${id}] ▶ Authentication successful - User ID:`, userId);
    console.log(`[PATCH /api/apiaries/${id}] ▶ Processing request for apiary ID:`, id);

    // Validate ID
    console.log(`[PATCH /api/apiaries/${id}] ▶ Validating apiary ID format...`);
    apiaryId = parseInt(id);
    if (isNaN(apiaryId)) {
      console.warn(`[PATCH /api/apiaries/${id}] ▶ Invalid apiary ID format - received: ${id}, type: ${typeof id}`);
      return NextResponse.json(
        { error: "Invalid apiary ID format. Must be a number." },
        { status: 400 }
      );
    }
    console.log(`[PATCH /api/apiaries/${id}] ▶ Apiary ID validation successful - parsed ID:`, apiaryId);

    let body: UpdateApiaryBody;
    try {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Parsing request body...`);
      body = await request.json();
      console.log(`[PATCH /api/apiaries/${id}] ▶ Request body parsed successfully:`, JSON.stringify(body, null, 2));
      console.log(`[PATCH /api/apiaries/${id}] ▶ Body keys:`, Object.keys(body));
    } catch (parseError) {
      console.error(`[PATCH /api/apiaries/${id}] ▶ Failed to parse request body:`, parseError);
      console.error(`[PATCH /api/apiaries/${id}] ▶ Parse error details:`, {
        name: parseError instanceof Error ? parseError.name : 'Unknown',
        message: parseError instanceof Error ? parseError.message : 'Unknown error'
      });
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate that at least one field is being updated
    console.log(`[PATCH /api/apiaries/${id}] ▶ Validating request body has fields to update...`);
    if (Object.keys(body).length === 0) {
      console.warn(`[PATCH /api/apiaries/${id}] ▶ No fields to update - empty body received`);
      return NextResponse.json(
        { error: "No fields to update. Please provide at least one field to update." },
        { status: 400 }
      );
    }

    // Check if the apiary exists and belongs to the user
    console.log(`[PATCH /api/apiaries/${id}] ▶ Checking if apiary exists and belongs to user...`);
    console.log(`[PATCH /api/apiaries/${id}] ▶ Database query - apiaryId: ${apiaryId}, userId: ${userId}`);
    
    const existingApiary = await prisma.apiary.findFirst({
      where: {
        id: apiaryId,
        userId: parseInt(String(userId))
      }
    });

    if (!existingApiary) {
      console.warn(`[PATCH /api/apiaries/${id}] ▶ Apiary not found or access denied`);
      console.warn(`[PATCH /api/apiaries/${id}] ▶ Query params - apiaryId: ${apiaryId}, userId: ${parseInt(String(userId))}`);
      return NextResponse.json(
        { error: "Apiary not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    console.log(`[PATCH /api/apiaries/${id}] ▶ Existing apiary found:`, {
      id: existingApiary.id,
      name: existingApiary.name,
      number: existingApiary.number,
      userId: existingApiary.userId
    });

    // If updating the apiary number, check for conflicts
    if (body.number && body.number !== existingApiary.number) {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Checking for number conflicts - new number: ${body.number}, current: ${existingApiary.number}`);
      
      const conflictingApiary = await prisma.apiary.findFirst({
        where: {
          number: body.number,
          userId: parseInt(String(userId)),
          NOT: {
            id: apiaryId
          }
        }
      });

      if (conflictingApiary) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Number conflict detected`);
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Conflicting apiary:`, {
          id: conflictingApiary.id,
          number: conflictingApiary.number,
          name: conflictingApiary.name
        });
        return NextResponse.json(
          { error: `An apiary with number '${body.number}' already exists` },
          { status: 409 }
        );
      }
      console.log(`[PATCH /api/apiaries/${id}] ▶ No number conflicts found`);
    }

    // Prepare update data with validation
    console.log(`[PATCH /api/apiaries/${id}] ▶ Starting field validation...`);
    const updateData: any = {};
    const validationErrors: string[] = [];
    
    if (body.hiveCount !== undefined) {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Validating hiveCount: ${body.hiveCount} (type: ${typeof body.hiveCount})`);
      if (typeof body.hiveCount !== 'number' || body.hiveCount < 0 || !Number.isInteger(body.hiveCount)) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Invalid hiveCount value`);
        validationErrors.push("Hive count must be a non-negative integer");
      } else {
        updateData.hiveCount = body.hiveCount;
        console.log(`[PATCH /api/apiaries/${id}] ▶ hiveCount validation passed`);
      }
    }

    if (body.name !== undefined) {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Validating name: "${body.name}" (length: ${body.name.length})`);
      const trimmedName = body.name.trim();
      if (!trimmedName) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Empty name after trimming`);
        validationErrors.push("Name cannot be empty");
      } else if (trimmedName.length > 255) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Name too long: ${trimmedName.length} characters`);
        validationErrors.push("Name cannot exceed 255 characters");
      } else {
        updateData.name = trimmedName;
        console.log(`[PATCH /api/apiaries/${id}] ▶ name validation passed - trimmed: "${trimmedName}"`);
      }
    }

    if (body.number !== undefined) {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Validating number: "${body.number}" (length: ${body.number.length})`);
      const trimmedNumber = body.number.trim();
      if (!trimmedNumber) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Empty number after trimming`);
        validationErrors.push("Number cannot be empty");
      } else if (trimmedNumber.length > 50) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Number too long: ${trimmedNumber.length} characters`);
        validationErrors.push("Number cannot exceed 50 characters");
      } else {
        updateData.number = trimmedNumber;
        console.log(`[PATCH /api/apiaries/${id}] ▶ number validation passed - trimmed: "${trimmedNumber}"`);
      }
    }

    if (body.latitude !== undefined) {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Validating latitude: ${body.latitude} (type: ${typeof body.latitude})`);
      if (typeof body.latitude !== 'number' || body.latitude < -90 || body.latitude > 90) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Invalid latitude value`);
        validationErrors.push("Latitude must be a number between -90 and 90");
      } else {
        updateData.latitude = body.latitude;
        console.log(`[PATCH /api/apiaries/${id}] ▶ latitude validation passed`);
      }
    }

    if (body.longitude !== undefined) {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Validating longitude: ${body.longitude} (type: ${typeof body.longitude})`);
      if (typeof body.longitude !== 'number' || body.longitude < -180 || body.longitude > 180) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Invalid longitude value`);
        validationErrors.push("Longitude must be a number between -180 and 180");
      } else {
        updateData.longitude = body.longitude;
        console.log(`[PATCH /api/apiaries/${id}] ▶ longitude validation passed`);
      }
    }

    if (body.kilosCollected !== undefined) {
      console.log(`[PATCH /api/apiaries/${id}] ▶ Validating kilosCollected: ${body.kilosCollected} (type: ${typeof body.kilosCollected})`);
      if (typeof body.kilosCollected !== 'number' || body.kilosCollected < 0) {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Invalid kilosCollected value`);
        validationErrors.push("Kilos collected must be a non-negative number");
      } else {
        updateData.kilosCollected = body.kilosCollected;
        console.log(`[PATCH /api/apiaries/${id}] ▶ kilosCollected validation passed`);
      }
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      console.warn(`[PATCH /api/apiaries/${id}] ▶ Validation failed with ${validationErrors.length} errors:`);
      validationErrors.forEach((error, index) => {
        console.warn(`[PATCH /api/apiaries/${id}] ▶ Validation error ${index + 1}: ${error}`);
      });
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // If no valid fields to update after validation
    if (Object.keys(updateData).length === 0) {
      console.warn(`[PATCH /api/apiaries/${id}] ▶ No valid fields to update after validation`);
      console.warn(`[PATCH /api/apiaries/${id}] ▶ Original body had ${Object.keys(body).length} fields, updateData has ${Object.keys(updateData).length} fields`);
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the apiary
    console.log(`[PATCH /api/apiaries/${id}] ▶ Performing database update...`);
    console.log(`[PATCH /api/apiaries/${id}] ▶ Update data:`, JSON.stringify(updateData, null, 2));
    console.log(`[PATCH /api/apiaries/${id}] ▶ Update query - WHERE id: ${apiaryId}`);
    
    const updatedApiary = await prisma.apiary.update({
      where: {
        id: apiaryId
      },
      data: updateData
    });

    console.log(`[PATCH /api/apiaries/${id}] ▶ Database update successful`);
    console.log(`[PATCH /api/apiaries/${id}] ▶ Updated apiary:`, {
      id: updatedApiary.id,
      name: updatedApiary.name,
      number: updatedApiary.number,
      hiveCount: updatedApiary.hiveCount,
      latitude: updatedApiary.latitude,
      longitude: updatedApiary.longitude,
      kilosCollected: updatedApiary.kilosCollected,
      
    });

    const duration = Date.now() - startTime;
    console.log(`[PATCH /api/apiaries/${id}] ▶ Request completed successfully in ${duration}ms`);

    return NextResponse.json({
      message: 'Apiary updated successfully',
      apiary: updatedApiary
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[PATCH /api/apiaries/${id}] ▶ Error occurred after ${duration}ms:`, error);
    console.error(`[PATCH /api/apiaries/${id}] ▶ Error details:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        console.error(`[PATCH /api/apiaries/${id}] ▶ Prisma error: Record to update not found`);
        return NextResponse.json(
          { error: 'Apiary not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Unique constraint failed')) {
        console.error(`[PATCH /api/apiaries/${id}] ▶ Prisma error: Unique constraint failed`);
        return NextResponse.json(
          { error: 'A conflict occurred while updating the apiary' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating the apiary',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500 }
    );
  } finally {
    console.log(`[PATCH /api/apiaries/${id}] ▶ Disconnecting from Prisma...`);
    await prisma.$disconnect();
    console.log(`[PATCH /api/apiaries/${id}] ▶ Prisma disconnected successfully`);
  }
}

// GET handler – get a specific apiary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  let apiaryId: number;

  // Await params before using
  const { id } = await params;
  
  console.log(`[GET /api/apiaries/${id}] ▶ Request started at ${new Date().toISOString()}`);
  console.log(`[GET /api/apiaries/${id}] ▶ Request headers:`, Object.fromEntries(request.headers.entries()));
  console.log(`[GET /api/apiaries/${id}] ▶ Request URL:`, request.url);

  try {
    console.log(`[GET /api/apiaries/${id}] ▶ Starting authentication...`);
    // Get the authenticated user ID
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      console.warn(`[GET /api/apiaries/${id}] ▶ Authentication failed - no user ID returned`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    console.log(`[GET /api/apiaries/${id}] ▶ Authentication successful - User ID:`, userId);
    console.log(`[GET /api/apiaries/${id}] ▶ Processing request for apiary ID:`, id);
    
    // Validate ID
    console.log(`[GET /api/apiaries/${id}] ▶ Validating apiary ID format...`);
    apiaryId = parseInt(id);
    if (isNaN(apiaryId)) {
      console.warn(`[GET /api/apiaries/${id}] ▶ Invalid apiary ID format - received: ${id}, type: ${typeof id}`);
      return NextResponse.json(
        { error: "Invalid apiary ID format. Must be a number." },
        { status: 400 }
      );
    }
    console.log(`[GET /api/apiaries/${id}] ▶ Apiary ID validation successful - parsed ID:`, apiaryId);

    // Find the apiary
    console.log(`[GET /api/apiaries/${id}] ▶ Querying database for apiary...`);
    console.log(`[GET /api/apiaries/${id}] ▶ Database query - apiaryId: ${apiaryId}, userId: ${userId}`);
    
    const apiary = await prisma.apiary.findFirst({
      where: {
        id: apiaryId,
        userId: parseInt(String(userId))
      }
    });

    if (!apiary) {
      console.warn(`[GET /api/apiaries/${id}] ▶ Apiary not found or access denied`);
      console.warn(`[GET /api/apiaries/${id}] ▶ Query params - apiaryId: ${apiaryId}, userId: ${parseInt(String(userId))}`);
      return NextResponse.json(
        { error: "Apiary not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    console.log(`[GET /api/apiaries/${id}] ▶ Apiary found successfully:`, {
      id: apiary.id,
      name: apiary.name,
      number: apiary.number,
      hiveCount: apiary.hiveCount,
      latitude: apiary.latitude,
      longitude: apiary.longitude,
      kilosCollected: apiary.kilosCollected,
      createdAt: apiary.createdAt,
      
      userId: apiary.userId
    });

    const duration = Date.now() - startTime;
    console.log(`[GET /api/apiaries/${id}] ▶ Request completed successfully in ${duration}ms`);

    return NextResponse.json({
      message: 'Apiary retrieved successfully',
      apiary
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[GET /api/apiaries/${id}] ▶ Error occurred after ${duration}ms:`, error);
    console.error(`[GET /api/apiaries/${id}] ▶ Error details:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while retrieving the apiary',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500 }
    );
  } finally {
    console.log(`[GET /api/apiaries/${id}] ▶ Disconnecting from Prisma...`);
    await prisma.$disconnect();
    console.log(`[GET /api/apiaries/${id}] ▶ Prisma disconnected successfully`);
  }
}

// DELETE handler – delete a specific apiary
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // FIXED: Made params a Promise
) {
  const startTime = Date.now();
  let apiaryId: number;

  // FIXED: Await params before using
  const { id } = await params;

  console.log(`[DELETE /api/apiaries/${id}] ▶ Request started at ${new Date().toISOString()}`);
  console.log(`[DELETE /api/apiaries/${id}] ▶ Request headers:`, Object.fromEntries(request.headers.entries()));
  console.log(`[DELETE /api/apiaries/${id}] ▶ Request URL:`, request.url);

  try {
    console.log(`[DELETE /api/apiaries/${id}] ▶ Starting authentication...`);
    // Get the authenticated user ID
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      console.warn(`[DELETE /api/apiaries/${id}] ▶ Authentication failed - no user ID returned`);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log(`[DELETE /api/apiaries/${id}] ▶ Authentication successful - User ID:`, userId);
    console.log(`[DELETE /api/apiaries/${id}] ▶ Processing delete request for apiary ID:`, id);
    
    // Validate ID
    console.log(`[DELETE /api/apiaries/${id}] ▶ Validating apiary ID format...`);
    apiaryId = parseInt(id);
    if (isNaN(apiaryId)) {
      console.warn(`[DELETE /api/apiaries/${id}] ▶ Invalid apiary ID format - received: ${id}, type: ${typeof id}`);
      return NextResponse.json(
        { error: "Invalid apiary ID format. Must be a number." },
        { status: 400 }
      );
    }
    console.log(`[DELETE /api/apiaries/${id}] ▶ Apiary ID validation successful - parsed ID:`, apiaryId);

    // Check if the apiary exists and belongs to the user
    console.log(`[DELETE /api/apiaries/${id}] ▶ Checking if apiary exists and belongs to user...`);
    console.log(`[DELETE /api/apiaries/${id}] ▶ Database query - apiaryId: ${apiaryId}, userId: ${userId}`);
    
    const existingApiary = await prisma.apiary.findFirst({
      where: {
        id: apiaryId,
        userId: parseInt(String(userId))
      }
    });

    if (!existingApiary) {
      console.warn(`[DELETE /api/apiaries/${id}] ▶ Apiary not found or access denied`);
      console.warn(`[DELETE /api/apiaries/${id}] ▶ Query params - apiaryId: ${apiaryId}, userId: ${parseInt(String(userId))}`);
      return NextResponse.json(
        { error: "Apiary not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    console.log(`[DELETE /api/apiaries/${id}] ▶ Apiary found and authorized for deletion:`, {
      id: existingApiary.id,
      name: existingApiary.name,
      number: existingApiary.number,
      userId: existingApiary.userId
    });

    // Delete the apiary
    console.log(`[DELETE /api/apiaries/${id}] ▶ Performing database deletion...`);
    console.log(`[DELETE /api/apiaries/${id}] ▶ Delete query - WHERE id: ${apiaryId}`);
    
    await prisma.apiary.delete({
      where: {
        id: apiaryId
      }
    });

    console.log(`[DELETE /api/apiaries/${id}] ▶ Database deletion successful`);

    const duration = Date.now() - startTime;
    console.log(`[DELETE /api/apiaries/${id}] ▶ Request completed successfully in ${duration}ms`);

    return NextResponse.json({
      message: 'Apiary deleted successfully',
      deletedApiaryId: apiaryId
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[DELETE /api/apiaries/${id}] ▶ Error occurred after ${duration}ms:`, error);
    console.error(`[DELETE /api/apiaries/${id}] ▶ Error details:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      console.error(`[DELETE /api/apiaries/${id}] ▶ Prisma error: Record to delete does not exist`);
      return NextResponse.json(
        { error: 'Apiary not found or already deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting the apiary',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      },
      { status: 500 }
    );
  } finally {
    console.log(`[DELETE /api/apiaries/${id}] ▶ Disconnecting from Prisma...`);
    await prisma.$disconnect();
    console.log(`[DELETE /api/apiaries/${id}] ▶ Prisma disconnected successfully`);
  }
}
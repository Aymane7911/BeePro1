// app/api/apiaries/locations/route.ts - Updated saved locations endpoint
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

// GET - Fetch saved location templates (no batchId)
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch ONLY saved locations (no batchId) - these are location templates
    const locations = await prisma.apiary.findMany({
      where: {
        userId: parseInt(String(userId)),
        batchId: null, // Only saved location templates
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Fetched ${locations.length} saved locations for user ${userId}`);
    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    console.error('Error fetching saved locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved locations' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Save a location template (no batchId)
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { latitude, longitude, name } = body;

    // Validate required fields
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    // Create location template (NO batchId - this makes it a saved location template)
    const newLocation = await prisma.apiary.create({
      data: {
        name: name || `Saved Location ${new Date().toLocaleDateString()}`,
        number: `LOC_${Date.now()}`, // Unique identifier for location templates
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        hiveCount: 0,
        kilosCollected: 0,
        batchId: null, // No batchId = saved location template
        userId: parseInt(String(userId)),
      },
    });

    console.log('Created new location template:', newLocation.id);
    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error('Error saving location template:', error);
    return NextResponse.json(
      { error: 'Failed to save location template', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Remove a saved location template
export async function DELETE(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    // Only allow deleting saved location templates (no batchId)
    const location = await prisma.apiary.findFirst({
      where: { 
        id: parseInt(id),
        userId: parseInt(String(userId)),
        batchId: null // Only allow deleting location templates, not actual apiaries
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location template not found or access denied' },
        { status: 404 }
      );
    }

    await prisma.apiary.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: 'Location template deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting location template:', error);
    return NextResponse.json(
      { error: 'Failed to delete location template' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
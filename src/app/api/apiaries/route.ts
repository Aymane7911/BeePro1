// src/app/api/apiaries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from "@/lib/auth";

const prisma = new PrismaClient();

interface LocationData {
  latitude: string | number;
  longitude: string | number;
}

interface CreateApiaryBody {
  name: string;
  number: string;
  hiveCount?: string | number;
  location?: LocationData; // Made optional since you're also sending individual coords
  latitude?: string | number; // Direct coordinates
  longitude?: string | number; // Direct coordinates
  honeyCollected?: string | number; // Mapped to kilosCollected in DB
  kilosCollected?: string | number; // Direct field
  locationName?: string; // Added locationName field
}

// GET handler – return all apiaries
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user data
    const authResult = await authenticateRequest(request);
        
    if (!authResult) {
      console.warn('[GET /api/apiaries] ▶ No authenticated user found');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract userId and databaseId from the auth result
    const { userId, databaseId } = authResult;
    console.log('[GET /api/apiaries] ▶ Authenticated user ID:', userId, 'Database ID:', databaseId);

    // Fetch all apiaries for the user in their specific database
    const apiaries = await prisma.apiary.findMany({
      where: {
        userId: parseInt(String(userId)),
        databaseId: databaseId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[GET /api/apiaries] ▶ Found ${apiaries.length} apiaries`);

    return NextResponse.json(apiaries);
  } catch (error) {
    console.error('Error in GET /api/apiaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST handler – create a new apiary
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user data
    const authResult = await authenticateRequest(request);
        
    if (!authResult) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Extract userId and databaseId from the auth result
    const { userId, databaseId } = authResult;
    console.log('[POST /api/apiaries] ▶ Authenticated user ID:', userId, 'Database ID:', databaseId);

    const body: CreateApiaryBody = await request.json();
    console.log('[POST /api/apiaries] ▶ Request body:', body);

    const { 
      name, 
      number, 
      hiveCount, 
      location, 
      latitude, 
      longitude, 
      honeyCollected, 
      kilosCollected,
      locationName 
    } = body;

    // Validate required fields
    if (!name || !number) {
      return NextResponse.json(
        { message: 'Name and number are required' },
        { status: 400 }
      );
    }

    // Extract coordinates - support both formats
    let lat: number, lng: number;
    
    if (location && location.latitude && location.longitude) {
      // Format 1: location object
      lat = parseFloat(String(location.latitude));
      lng = parseFloat(String(location.longitude));
    } else if (latitude && longitude) {
      // Format 2: direct latitude/longitude fields
      lat = parseFloat(String(latitude));
      lng = parseFloat(String(longitude));
    } else {
      return NextResponse.json(
        { message: 'Location coordinates (latitude and longitude) are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { message: 'Invalid latitude or longitude values' },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90) {
      return NextResponse.json(
        { message: 'Latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (lng < -180 || lng > 180) {
      return NextResponse.json(
        { message: 'Longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    // Check if an apiary with the same number already exists in this database
    const existingApiary = await prisma.apiary.findFirst({
      where: { 
        number,
        userId: parseInt(String(userId)),
        databaseId: databaseId,
      },
    });
    
    if (existingApiary) {
      return NextResponse.json(
        { message: 'An apiary with this number already exists' },
        { status: 409 } // Conflict
      );
    }

    // Process locationName - handle null/empty strings properly
    let processedLocationName: string | null = null;
    if (locationName && typeof locationName === 'string') {
      const trimmed = locationName.trim();
      if (trimmed.length > 0) {
        processedLocationName = trimmed;
      }
    }

    // Determine kilos collected - priority: kilosCollected, then honeyCollected
    const finalKilosCollected = parseFloat(String(kilosCollected || honeyCollected)) || 0;

    // Create the new apiary
    const newApiary = await prisma.apiary.create({
      data: {
        name: name.trim(),
        number: number.trim(),
        hiveCount: parseInt(String(hiveCount)) || 0,
        latitude: lat,
        longitude: lng,
        locationName: processedLocationName,
        kilosCollected: Math.max(0, finalKilosCollected),
        userId: parseInt(String(userId)),
        databaseId: databaseId, // Use the databaseId from auth result
      },
    });

    console.log('[POST /api/apiaries] ▶ Created new apiary:', newApiary.id);

    return NextResponse.json(newApiary, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/apiaries:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
// src/app/api/apiaries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from "@/lib/auth";
import { parse } from 'path';

const prisma = new PrismaClient();

interface LocationData {
  latitude: string | number;
  longitude: string | number;
}

interface CreateApiaryBody {
  name: string;
  number: string;
  hiveCount?: string | number;
  location: LocationData;
  honeyCollected?: string | number; // Mapped to kilosCollected in DB
}

// GET handler – return all apiaries
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user ID
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      console.warn('[GET /api/apiaries] ▶ No authenticated user found');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('[GET /api/apiaries] ▶ Authenticated user ID:', userId);

    // Fetch all apiaries, ordered by creation date descending
    const apiaries = await prisma.apiary.findMany({
        where: {
            userId: parseInt(String(userId)), 
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
    // Get the authenticated user ID
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log('[POST /api/apiaries] ▶ Authenticated user ID:', userId);

    const body: CreateApiaryBody = await request.json();
    const { name, number, hiveCount, location, honeyCollected } = body;

    // Validate required fields
    if (!name || !number || !location) {
      return NextResponse.json(
        { message: 'Name, number, and location are required' },
        { status: 400 }
      );
    }

    // Validate location has required coordinates
    if (!location.latitude || !location.longitude) {
      return NextResponse.json(
        { message: 'Location must include latitude and longitude' },
        { status: 400 }
      );
    }

    // Check if an apiary with the same number already exists
    const existingApiary = await prisma.apiary.findFirst({
      where: { number,
               userId: parseInt(String(userId))
       },
    });
    if (existingApiary) {
      return NextResponse.json(
        { message: 'An apiary with this number already exists' },
        { status: 409 } // Conflict
      );
    }

    // Create the new apiary
    const newApiary = await prisma.apiary.create({
      data: {
        name,
        number,
        hiveCount: parseInt(String(hiveCount)) || 0,
        latitude: parseFloat(String(location.latitude)),
        longitude: parseFloat(String(location.longitude)),
        kilosCollected: parseFloat(String(honeyCollected)) || 0,
        userId: parseInt(String(userId)),
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
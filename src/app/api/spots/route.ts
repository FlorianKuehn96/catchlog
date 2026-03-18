import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';
import type { Spot, User, Catch } from '@/types';

// GET /api/spots - List all spots for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redis = getRedis();
    const userData = await redis.get(keys.user(session.user.email));
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userData as User;
    
    // Try to get spots - handle both array (from set) and direct formats
    let spotIds: string[] = [];
    try {
      const spotsData = await redis.get(keys.spotsByUser(user.id));
      if (Array.isArray(spotsData)) {
        spotIds = spotsData;
      }
    } catch (e) {
      console.log('No spots found or error:', e);
    }

    const spots: Spot[] = [];
    for (const spotId of spotIds) {
      try {
        const spotData = await redis.get(keys.spot(spotId));
        if (spotData) {
          spots.push(spotData as Spot);
        }
      } catch (e) {
        console.log('Error loading spot:', spotId, e);
      }
    }

    return NextResponse.json({ spots });
  } catch (error: any) {
    console.error('Error in spots GET:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

// POST /api/spots - Create new spot
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  const userData = await redis.get(keys.user(session.user.email));
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = userData as User;
  
  try {
    const body = await request.json();
    const { name, lat, lng, type, notes } = body;

    if (!name || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newSpot: Spot = {
      id: crypto.randomUUID(),
      userId: user.id,
      name,
      lat,
      lng,
      type: type || 'lake',
      notes,
      createdAt: new Date().toISOString(),
    };

    await redis.set(keys.spot(newSpot.id), newSpot);
    
    // Add to user's spots list (handle as array)
    const existingSpots = await redis.get(keys.spotsByUser(user.id)) as string[] || [];
    existingSpots.push(newSpot.id);
    await redis.set(keys.spotsByUser(user.id), existingSpots);

    return NextResponse.json({ spot: newSpot }, { status: 201 });
  } catch (error) {
    console.error('Error creating spot:', error);
    return NextResponse.json(
      { error: 'Failed to create spot' },
      { status: 500 }
    );
  }
}

// DELETE /api/spots?id=xxx - Delete spot
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  const userData = await redis.get(keys.user(session.user.email));
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = userData as User;
  const { searchParams } = new URL(request.url);
  const spotId = searchParams.get('id');

  if (!spotId) {
    return NextResponse.json({ error: 'Missing spot ID' }, { status: 400 });
  }

  const spotData = await redis.get(keys.spot(spotId));
  if (!spotData) {
    return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
  }

  const spot = spotData as Spot;
  if (spot.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Check if spot has catches
  const catches = await redis.lrange(keys.catchesBySpot(spotId), 0, 0);
  if (catches.length > 0) {
    return NextResponse.json(
      { error: 'Cannot delete spot with catches' },
      { status: 400 }
    );
  }

  await redis.del(keys.spot(spotId));
  
  // Remove from user's spots list
  const existingSpots = await redis.get(keys.spotsByUser(user.id)) as string[] || [];
  const updatedSpots = existingSpots.filter(id => id !== spotId);
  await redis.set(keys.spotsByUser(user.id), updatedSpots);

  return NextResponse.json({ success: true });
}

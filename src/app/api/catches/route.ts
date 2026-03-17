import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getRedis, keys } from '@/lib/redis';
import { fetchWeather } from '@/lib/weather';
import type { Catch, User } from '@/types';

// GET /api/catches - List all catches for user
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = getRedis();
  const userData = await redis.get(keys.user(session.user.email));
  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = userData as User;
  const catchIds = await redis.lrange(keys.catchesByUser(user.id), 0, -1);
  
  const catches: Catch[] = [];
  for (const catchId of catchIds) {
    const catchData = await redis.get(keys.catch(catchId));
    if (catchData) {
      const c = catchData as Catch;
      // Enrich with spot data
      const spotData = await redis.get(keys.spot(c.spotId));
      if (spotData) {
        c.spot = spotData as any;
      }
      catches.push(c);
    }
  }

  // Sort by timestamp desc
  catches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json({ catches });
}

// POST /api/catches - Create new catch
// NOTE: Photo upload disabled for MVP - Cloudinary not configured
export async function POST(request: NextRequest) {
  const session = await getServerSession();
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
    
    const { spotId, species, length, weight, bait, technique, notes } = body;
    const timestamp = new Date().toISOString();

    if (!spotId || !species || !bait) {
      return NextResponse.json(
        { error: 'Missing required fields: spotId, species, bait' },
        { status: 400 }
      );
    }

    // Get spot data
    const spotData = await redis.get(keys.spot(spotId));
    if (!spotData) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }
    const spot = spotData as any;

    // Fetch weather data
    let weather;
    try {
      weather = await fetchWeather(spot.lat, spot.lng, timestamp);
    } catch {
      // Fallback weather data
      weather = {
        temp: 15,
        pressure: 1013,
        windSpeed: 10,
        windDirection: 180,
        conditions: 'Unbekannt',
      };
    }

    // Create catch (without photo for MVP)
    const newCatch: Catch = {
      id: crypto.randomUUID(),
      userId: user.id,
      spotId,
      species,
      length,
      weight,
      bait,
      technique,
      weather,
      timestamp,
      notes,
      // photoUrl disabled for MVP
    };

    // Save to Redis
    await redis.set(keys.catch(newCatch.id), newCatch);
    await redis.lpush(keys.catchesByUser(user.id), newCatch.id);
    await redis.lpush(keys.catchesBySpot(spotId), newCatch.id);

    return NextResponse.json({ catch: newCatch }, { status: 201 });
  } catch (error) {
    console.error('Error creating catch:', error);
    return NextResponse.json(
      { error: 'Failed to create catch' },
      { status: 500 }
    );
  }
}

// DELETE /api/catches?id=xxx - Delete catch
// NOTE: Photo deletion disabled for MVP
export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
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
  const catchId = searchParams.get('id');

  if (!catchId) {
    return NextResponse.json({ error: 'Missing catch ID' }, { status: 400 });
  }

  const catchData = await redis.get(keys.catch(catchId));
  if (!catchData) {
    return NextResponse.json({ error: 'Catch not found' }, { status: 404 });
  }

  const c = catchData as Catch;
  if (c.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Remove from Redis
  await redis.del(keys.catch(catchId));
  await redis.lrem(keys.catchesByUser(user.id), 0, catchId);
  await redis.lrem(keys.catchesBySpot(c.spotId), 0, catchId);

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getRedis, keys } from '@/lib/redis';
import { uploadImage, getPublicIdFromUrl } from '@/lib/cloudinary';
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
  
  // Check subscription limit for free users
  if (user.subscription === 'free') {
    const catchCount = await redis.llen(keys.catchesByUser(user.id));
    if (catchCount >= 50) {
      return NextResponse.json(
        { error: 'Limit reached. Upgrade to Pro for unlimited catches.' },
        { status: 403 }
      );
    }
  }

  try {
    const formData = await request.formData();
    
    const spotId = formData.get('spotId') as string;
    const species = formData.get('species') as string;
    const length = parseFloat(formData.get('length') as string) || undefined;
    const weight = parseFloat(formData.get('weight') as string) || undefined;
    const bait = formData.get('bait') as string;
    const technique = formData.get('technique') as string || undefined;
    const notes = formData.get('notes') as string || undefined;
    const photoFile = formData.get('photo') as File;
    const useCurrentLocation = formData.get('useCurrentLocation') === 'true';
    const timestamp = new Date().toISOString();

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

    // Upload photo
    let photoUrl: string | undefined;
    if (photoFile && photoFile.size > 0) {
      try {
        photoUrl = await uploadImage(photoFile);
      } catch (error) {
        console.error('Photo upload failed:', error);
      }
    }

    // Create catch
    const newCatch: Catch = {
      id: crypto.randomUUID(),
      userId: user.id,
      spotId,
      species,
      length,
      weight,
      photoUrl,
      bait,
      technique,
      weather,
      timestamp,
      notes,
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

  // Delete photo if exists
  if (c.photoUrl) {
    const publicId = getPublicIdFromUrl(c.photoUrl);
    if (publicId) {
      const { deleteImage } = await import('@/lib/cloudinary');
      await deleteImage(publicId).catch(console.error);
    }
  }

  // Remove from Redis
  await redis.del(keys.catch(catchId));
  await redis.lrem(keys.catchesByUser(user.id), 0, catchId);
  await redis.lrem(keys.catchesBySpot(c.spotId), 0, catchId);

  return NextResponse.json({ success: true });
}

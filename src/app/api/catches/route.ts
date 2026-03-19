import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';
import { fetchWeather, getSunPosition } from '@/lib/weather';
import type { Catch, User } from '@/types';

// GET /api/catches - List all catches for user
export async function GET(request: NextRequest) {
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
    
    const { spotId, species, length, weight, bait, technique, notes, timestamp, catchLat, catchLng, imageUrl } = body;
    
    // Timestamp aus Body oder jetzt
    const catchTimestamp = timestamp || new Date().toISOString();
    const catchDate = new Date(catchTimestamp);
    const date = catchDate.toISOString().split('T')[0];
    const time = catchDate.toTimeString().slice(0, 5); // HH:MM

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
      weather = await fetchWeather(spot.lat, spot.lng, catchTimestamp);
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

    // Calculate sun position
    let sunPosition;
    try {
      sunPosition = getSunPosition(spot.lat, spot.lng, catchDate);
    } catch {
      // Fallback
      sunPosition = {
        hoursFromSunrise: 0,
        hoursFromSunset: 0,
        phase: 'day' as const,
      };
    }

    // Create catch (without photo for MVP)
    const newCatch: Catch = {
      id: crypto.randomUUID(),
      userId: user.id,
      spotId,
      lat: spot.lat,        // Kopie für Karte
      lng: spot.lng,        // Kopie für Karte
      ...(catchLat !== undefined && catchLng !== undefined && {
        catchLat,
        catchLng,
      }),
      species,
      length,
      weight,
      bait,
      technique,
      weather,
      timestamp: catchTimestamp,
      date,
      time,
      sunPosition,
      notes,
      ...(imageUrl && { photoUrl: imageUrl }),
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

// PUT /api/catches - Update existing catch
export async function PUT(request: NextRequest) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing catch ID' }, { status: 400 });
    }

    // Get existing catch
    const catchData = await redis.get(keys.catch(id));
    if (!catchData) {
      return NextResponse.json({ error: 'Catch not found' }, { status: 404 });
    }

    const existingCatch = catchData as Catch;
    
    // Verify ownership
    if (existingCatch.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update timestamp fields if timestamp changed
    let date = existingCatch.date;
    let time = existingCatch.time;
    let sunPosition = existingCatch.sunPosition;
    let lat = existingCatch.lat;
    let lng = existingCatch.lng;
    
    // If spot changed, update coordinates
    if (updates.spotId && updates.spotId !== existingCatch.spotId) {
      const newSpotData = await redis.get(keys.spot(updates.spotId));
      if (newSpotData) {
        const newSpot = newSpotData as any;
        lat = newSpot.lat;
        lng = newSpot.lng;
      }
    }
    
    if (updates.timestamp && updates.timestamp !== existingCatch.timestamp) {
      const catchDate = new Date(updates.timestamp);
      date = catchDate.toISOString().split('T')[0];
      time = catchDate.toTimeString().slice(0, 5);
      
      // Recalculate sun position
      try {
        const spotData = await redis.get(keys.spot(updates.spotId || existingCatch.spotId));
        if (spotData) {
          const spot = spotData as any;
          sunPosition = getSunPosition(spot.lat, spot.lng, catchDate);
        }
      } catch {
        // Keep existing sun position
      }
    }

    // Merge updates
    const updatedCatch: Catch = {
      ...existingCatch,
      ...updates,
      lat,
      lng,
      date,
      time,
      sunPosition,
      id, // Ensure ID doesn't change
      userId: existingCatch.userId, // Ensure ownership doesn't change
    };

    // Save to Redis
    await redis.set(keys.catch(id), updatedCatch);

    return NextResponse.json({ catch: updatedCatch });
  } catch (error) {
    console.error('Error updating catch:', error);
    return NextResponse.json(
      { error: 'Failed to update catch' },
      { status: 500 }
    );
  }
}

// DELETE /api/catches?id=xxx - Delete catch and photo from Cloudinary
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

  // Delete photo from Cloudinary if exists
  if (c.photoUrl) {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (cloudName && apiKey && apiSecret) {
        // Extract public_id from photoUrl
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/.../folder/filename.jpg
        const urlMatch = c.photoUrl.match(/\/([^\/]+)\/[^\/]+$/);
        if (urlMatch) {
          const publicId = urlMatch[1].replace(/\.[^/.]+$/, ''); // Remove extension
          const fullPublicId = `catchlog/catches/${publicId}`;

          // Generate signature for deletion
          const timestamp = Math.floor(Date.now() / 1000);
          const signatureString = `public_id=${fullPublicId}&timestamp=${timestamp}${apiSecret}`;
          const signature = require('crypto').createHash('sha1').update(signatureString).digest('hex');

          // Delete from Cloudinary
          const deleteRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              public_id: fullPublicId,
              api_key: apiKey,
              timestamp,
              signature,
            }),
          });

          if (!deleteRes.ok) {
            console.error('Cloudinary delete failed:', await deleteRes.text());
          }
        }
      }
    } catch (err) {
      // Log error but don't fail the delete operation
      console.error('Error deleting photo from Cloudinary:', err);
    }
  }

  // Remove from Redis
  await redis.del(keys.catch(catchId));
  await redis.lrem(keys.catchesByUser(user.id), 0, catchId);
  await redis.lrem(keys.catchesBySpot(c.spotId), 0, catchId);

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';
import { checkRateLimit } from '@/lib/rate-limit';
import { fetchWeather, getSunPosition } from '@/lib/weather';
import { catchSchema } from '@/lib/validation';
import type { Catch, User, Spot } from '@/types';

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
  
  // Batch load all catches
  if (catchIds.length === 0) {
    return NextResponse.json({ catches: [] });
  }

  const pipeline = redis.pipeline();
  catchIds.forEach((id) => pipeline.get(keys.catch(id)));
  const catchesData = await pipeline.exec();

  // Collect unique spot IDs for batch loading
  const spotIds = new Set<string>();
  const catches: Catch[] = [];
  
  catchesData?.forEach((data) => {
    if (data) {
      const c = data as Catch;
      catches.push(c);
      spotIds.add(c.spotId);
    }
  });

  // Batch load spots
  const spotPipeline = redis.pipeline();
  spotIds.forEach((id) => spotPipeline.get(keys.spot(id)));
  const spotsData = await spotPipeline.exec();
  
  const spotsMap = new Map<string, Spot>();
  spotsData?.forEach((data) => {
    if (data) {
      const spot = data as Spot;
      spotsMap.set(spot.id, spot);
    }
  });

  // Enrich catches with spot data
  catches.forEach((c) => {
    c.spot = spotsMap.get(c.spotId);
  });

  // Sort by timestamp desc
  catches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json({ catches });
}

// POST /api/catches - Create new catch
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

  // Rate limiting
  const rateLimit = await checkRateLimit(user.id, 'POST:/api/catches');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', resetTime: rateLimit.resetTime },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    
    // Zod-Validierung
    const result = catchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: result.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { spotId, species, length, weight, bait, technique, notes, timestamp, catchLat, catchLng, imageUrl } = result.data;
    
    // Timestamp aus Body oder jetzt
    const catchTimestamp = timestamp || new Date().toISOString();
    const catchDate = new Date(catchTimestamp);
    const date = catchDate.toISOString().split('T')[0];
    const time = catchDate.toTimeString().slice(0, 5); // HH:MM

    // Get spot data
    const spotData = await redis.get(keys.spot(spotId!));
    if (!spotData) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 });
    }
    const spot = spotData as Spot;

    // Fetch weather data
    let weather;
    try {
      weather = await fetchWeather(spot.lat, spot.lng, catchTimestamp);
    } catch (err) {
      console.error('Weather fetch failed:', err);
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
    } catch (err) {
      console.error('Sun position calc failed:', err);
      // Fallback
      sunPosition = {
        hoursFromSunrise: 0,
        hoursFromSunset: 0,
        phase: 'day' as const,
      };
    }

    // Create catch
    const newCatch: Catch = {
      id: crypto.randomUUID(),
      userId: user.id,
      spotId: spotId!,
      lat: spot.lat,
      lng: spot.lng,
      ...(catchLat !== undefined && catchLng !== undefined && {
        catchLat,
        catchLng,
      }),
      species,
      length: length || undefined,
      weight: weight || undefined,
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
    await redis.lpush(keys.catchesBySpot(spotId!), newCatch.id);

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

  // Rate limiting
  const rateLimit = await checkRateLimit(user.id, 'PUT:/api/catches');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', resetTime: rateLimit.resetTime },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing catch ID' }, { status: 400 });
    }

    // Zod-Validierung für Updates
    const updateSchema = catchSchema.partial();
    const result = updateSchema.safeParse(updates);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: result.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedUpdates = result.data;

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
    if (validatedUpdates.spotId && validatedUpdates.spotId !== existingCatch.spotId) {
      const newSpotData = await redis.get(keys.spot(validatedUpdates.spotId));
      if (newSpotData) {
        const newSpot = newSpotData as Spot;
        lat = newSpot.lat;
        lng = newSpot.lng;
      }
    }
    
    if (validatedUpdates.timestamp && validatedUpdates.timestamp !== existingCatch.timestamp) {
      const catchDate = new Date(validatedUpdates.timestamp);
      date = catchDate.toISOString().split('T')[0];
      time = catchDate.toTimeString().slice(0, 5);
      
      // Recalculate sun position
      try {
        const spotData = await redis.get(keys.spot(validatedUpdates.spotId || existingCatch.spotId));
        if (spotData) {
          const spot = spotData as Spot;
          sunPosition = getSunPosition(spot.lat, spot.lng, catchDate);
        }
      } catch (err) {
        console.error('Sun position recalc failed:', err);
        // Keep existing sun position
      }
    }

    // Merge updates
    const updatedCatch: Catch = {
      ...existingCatch,
      ...validatedUpdates,
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

  // Rate limiting
  const rateLimit = await checkRateLimit(user.id, 'DELETE:/api/catches');
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', resetTime: rateLimit.resetTime },
      { status: 429 }
    );
  }
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

      console.log('Deleting photo from Cloudinary:', c.photoUrl);

      if (cloudName && apiKey && apiSecret) {
        // Extract public_id from photoUrl
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/c_limit,w_1200,h_1200,q_auto/v1234567890/catchlog/catches/filename.jpg
        // Or: https://res.cloudinary.com/{cloud}/image/upload/v1234567890/catchlog/catches/filename.jpg
        // We need: catchlog/catches/filename (without extension)
        const urlObj = new URL(c.photoUrl);
        const pathParts = urlObj.pathname.split('/');
        
        // Find the version number (starts with 'v') and extract everything after it
        let startIndex = -1;
        for (let i = 0; i < pathParts.length; i++) {
          if (pathParts[i].match(/^v\d+$/)) {
            startIndex = i + 1;
            break;
          }
        }
        
        if (startIndex !== -1 && startIndex < pathParts.length) {
          // Join remaining parts to get public_id with folder
          const publicIdWithExtension = pathParts.slice(startIndex).join('/');
          const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension

          console.log('Cloudinary public_id:', publicId);

          // Generate signature for deletion
          const timestamp = Math.floor(Date.now() / 1000);
          const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
          const crypto = await import('crypto');
          const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

          // Delete from Cloudinary (using form data, not JSON)
          const formData = new URLSearchParams();
          formData.append('public_id', publicId);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp.toString());
          formData.append('signature', signature);

          const deleteRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
          });

          const deleteResult = await deleteRes.json();
          console.log('Cloudinary delete result:', deleteResult);

          if (!deleteRes.ok) {
            console.error('Cloudinary delete failed:', deleteResult);
          }
        } else {
          console.error('Could not parse Cloudinary URL:', c.photoUrl);
        }
      } else {
        console.log('Cloudinary credentials not configured, skipping photo deletion');
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

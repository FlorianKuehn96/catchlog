import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getRedis, keys } from '@/lib/redis';
import type { Spot, User } from '@/types';

// GET /api/spots/nearby?lat=...&lng=...&radius=10 (km)
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
  const { searchParams } = new URL(request.url);
  
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseFloat(searchParams.get('radius') || '10'); // km

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude required' },
      { status: 400 }
    );
  }

  // Get all spots and calculate distance
  const spotIds = await redis.smembers(keys.spotsByUser(user.id));
  const spots: (Spot & { distance: number })[] = [];
  
  for (const spotId of spotIds) {
    const spotData = await redis.get(keys.spot(spotId));
    if (spotData) {
      const spot = spotData as Spot;
      const distance = calculateDistance(lat, lng, spot.lat, spot.lng);
      if (distance <= radius) {
        spots.push({ ...spot, distance: Math.round(distance * 100) / 100 });
      }
    }
  }
  
  // Sort by distance
  spots.sort((a, b) => a.distance - b.distance);

  return NextResponse.json({ spots });
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

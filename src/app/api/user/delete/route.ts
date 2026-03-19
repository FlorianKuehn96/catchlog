import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';
import type { User } from '@/types';

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const redis = getRedis();
    
    // Get user data
    const userData = await redis.get(keys.user(session.user.email));
    if (!userData) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    const user = userData as User;
    const userId = user.id;

    // Delete all user's catches - handle both array and string formats
    try {
      const catchesData = await redis.get(keys.catchesByUser(userId));
      const catchIds = Array.isArray(catchesData) ? catchesData : [];
      for (const catchId of catchIds) {
        if (catchId) await redis.del(keys.catch(catchId));
      }
      await redis.del(keys.catchesByUser(userId));
    } catch (e) {
      console.log('No catches to delete or error:', e);
    }

    // Delete all user's spots - handle both array and string formats
    try {
      const spotsData = await redis.get(keys.spotsByUser(userId));
      const spotIds = Array.isArray(spotsData) ? spotsData : [];
      for (const spotId of spotIds) {
        if (spotId) await redis.del(keys.spot(spotId));
      }
      await redis.del(keys.spotsByUser(userId));
    } catch (e) {
      console.log('No spots to delete or error:', e);
    }

    // Delete user
    await redis.del(keys.user(session.user.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json(
      { error: `Fehler: ${message}` },
      { status: 500 }
    );
  }
}

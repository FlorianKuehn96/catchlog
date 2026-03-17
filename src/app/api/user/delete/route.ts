import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';

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

    const user = userData as any;
    const userId = user.id;

    // Delete all user's catches
    const catchIds = await redis.get(keys.catchesByUser(userId)) as string[] || [];
    for (const catchId of catchIds) {
      await redis.del(keys.catch(catchId));
    }
    await redis.del(keys.catchesByUser(userId));

    // Delete all user's spots
    const spotIds = await redis.get(keys.spotsByUser(userId)) as string[] || [];
    for (const spotId of spotIds) {
      await redis.del(keys.spot(spotId));
    }
    await redis.del(keys.spotsByUser(userId));

    // Delete user
    await redis.del(keys.user(session.user.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Accounts' },
      { status: 500 }
    );
  }
}

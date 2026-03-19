import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';
import type { User } from '@/types';

// PUT /api/user/update - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    const redis = getRedis();
    
    // Get current user data
    const userData = await redis.get(keys.user(session.user.email));
    if (!userData) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    const user = userData as User;

    // Update fields
    if (name !== undefined) {
      user.name = name.trim() || undefined;
    }
    
    if (image !== undefined) {
      user.image = image || undefined;
    }

    // Save updated user
    await redis.set(keys.user(session.user.email), user);

    return NextResponse.json({ 
      success: true, 
      user: {
        name: user.name,
        image: user.image,
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json(
      { error: `Fehler: ${message}` },
      { status: 500 }
    );
  }
}

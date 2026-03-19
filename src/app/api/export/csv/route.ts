import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRedis, keys } from '@/lib/redis';

// GET /api/export/csv - Export all catches as CSV
export async function GET(req: NextRequest) {
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

    // Get all catches (stored as list)
    const catchIds = await redis.lrange(keys.catchesByUser(userId), 0, -1);
    
    const catches = [];
    for (const id of catchIds) {
      const c = await redis.get(keys.catch(id));
      if (c) catches.push(c);
    }

    // Get spots for reference (stored as array via set)
    const spotsData = await redis.get(keys.spotsByUser(userId));
    const spotIds = Array.isArray(spotsData) ? spotsData : [];
    const spots: Record<string, any> = {};
    for (const id of spotIds) {
      const s = await redis.get(keys.spot(id));
      if (s) {
        const spot = s as any;
        spots[spot.id] = spot;
      }
    }

    // Sort by date descending
    catches.sort((a: any, b: any) => 
      new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime()
    );

    // CSV Header
    const headers = [
      'Datum',
      'Zeit',
      'Fischart',
      'Gewässer',
      'Länge (cm)',
      'Gewicht (kg)',
      'Köder',
      'Technik',
      'Wetter',
      'Temperatur (°C)',
      'Sonnenstand',
      'Notizen',
      'Koordinaten',
    ];

    // CSV Rows
    const rows = catches.map((c: any) => {
      const spot = spots[c.spotId];
      const sunPos = c.sunPosition;
      let sunText = '';
      if (sunPos) {
        if (sunPos.phase === 'dawn') sunText = 'Morgendämmerung';
        else if (sunPos.phase === 'dusk') sunText = 'Abenddämmerung';
        else if (sunPos.phase === 'night') sunText = 'Nacht';
        else sunText = `Tag (${Math.round(sunPos.hoursFromSunrise * 10) / 10}h nach Sonnenaufgang)`;
      }

      return [
        c.date || new Date(c.timestamp).toLocaleDateString('de-DE'),
        c.time || '',
        c.species,
        spot?.name || 'Unbekannt',
        c.length || '',
        c.weight || '',
        c.bait || '',
        c.technique || '',
        c.weather || '',
        c.temperature || '',
        sunText,
        c.notes ? `"${c.notes.replace(/"/g, '""')}"` : '',
        c.catchLat && c.catchLng ? `${c.catchLat},${c.catchLng}` : '',
      ];
    });

    // Build CSV
    const csv = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    // Return as downloadable file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="catchlog-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: `Fehler: ${error.message || 'Unbekannter Fehler'}` },
      { status: 500 }
    );
  }
}

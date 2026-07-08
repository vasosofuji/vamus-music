import YTMusic from 'ytmusic-api';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const artistNames = (searchParams.get('artistNames') || '').split(',').filter(Boolean).slice(0, 5);

  if (!artistNames.length) return NextResponse.json([]);

  try {
    const yt = new YTMusic();
    await yt.initialize();

    const seen = new Set();
    const recommended = [];

    for (const name of artistNames) {
      try {
        const results = await yt.searchArtists(name);
        for (const a of results.slice(0, 3)) {
          if (!seen.has(a.artistId) && !artistNames.map(n=>n.toLowerCase()).includes(a.name.toLowerCase())) {
            seen.add(a.artistId);
            recommended.push({
              id: a.artistId,
              name: a.name,
              thumbnail: a.thumbnails?.[a.thumbnails.length - 1]?.url || '',
              type: 'artist',
            });
          }
        }
      } catch {}
      if (recommended.length >= 10) break;
    }

    return NextResponse.json(recommended.slice(0, 10));
  } catch (error) {
    console.error('Recommendations error:', error.message);
    return NextResponse.json([]);
  }
}

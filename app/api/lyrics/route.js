import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get('track');
  const artist = searchParams.get('artist');

  if (!track || !artist) {
    return NextResponse.json({ error: 'Missing track or artist' }, { status: 400 });
  }

  const headers = { 'User-Agent': 'VamusMusicPlayer (vamus@example.com)' };

  try {
    // 1. Try exact match
    let res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics) {
        return NextResponse.json({ syncedLyrics: data.syncedLyrics, plainLyrics: data.plainLyrics });
      }
    }

    // 2. Fallback to Search with track + artist
    res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(track + ' ' + artist)}`, { headers });
    if (res.ok) {
      const results = await res.json();
      const match = results.find(r => r.syncedLyrics);
      if (match) {
        return NextResponse.json({ syncedLyrics: match.syncedLyrics, plainLyrics: match.plainLyrics });
      }
    }

    // 3. Fallback to Search with just track
    res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(track)}`, { headers });
    if (res.ok) {
      const results = await res.json();
      const match = results.find(r => r.syncedLyrics);
      if (match) {
        return NextResponse.json({ syncedLyrics: match.syncedLyrics, plainLyrics: match.plainLyrics });
      }
    }

    return NextResponse.json({ syncedLyrics: null, plainLyrics: null });
  } catch (error) {
    console.error('Lyrics fetch error:', error);
    return NextResponse.json({ syncedLyrics: null, plainLyrics: null });
  }
}

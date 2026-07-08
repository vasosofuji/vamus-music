import YTMusic from 'ytmusic-api';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'songs';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const yt = new YTMusic();
    await yt.initialize();

    if (type === 'artists') {
      const results = await yt.searchArtists(query);
      return NextResponse.json(results.map(a => ({
        id: a.artistId,
        name: a.name,
        thumbnail: a.thumbnails?.[a.thumbnails.length - 1]?.url || '',
        type: 'artist',
      })));
    }

    // Songs
    const queries = [query, `${query} audio`, `${query} official`];
    const resultsArrays = await Promise.all(queries.map(q => yt.searchSongs(q)));
    const map = new Map();
    resultsArrays.flat().forEach(song => {
      if (!map.has(song.videoId)) {
        map.set(song.videoId, {
          id: song.videoId,
          title: song.name,
          url: `https://music.youtube.com/watch?v=${song.videoId}`,
          thumbnail: song.thumbnails?.[song.thumbnails.length - 1]?.url || '',
          durationRaw: song.duration
            ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
            : '',
          durationInSec: song.duration || 0,
          artistId: song.artist?.artistId || null,
          channel: { name: song.artist?.name || 'Unknown Artist' },
        });
      }
    });
    return NextResponse.json(Array.from(map.values()));
  } catch (error) {
    console.error('Search error:', error.message);
    return NextResponse.json({ error: 'Failed to search YouTube Music' }, { status: 500 });
  }
}

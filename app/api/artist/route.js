import YTMusic from 'ytmusic-api';
import { NextResponse } from 'next/server';

function mapSong(song, artistName, artistId) {
  return {
    id: song.videoId,
    title: song.name,
    url: `https://music.youtube.com/watch?v=${song.videoId}`,
    thumbnail: song.thumbnails?.[song.thumbnails.length - 1]?.url || '',
    durationRaw: song.duration
      ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
      : '',
    durationInSec: song.duration || 0,
    artistId: song.artist?.artistId || artistId || null,
    channel: {
      name: song.artist?.name || artistName || 'Unknown',
    },
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  try {
    const yt = new YTMusic();
    await yt.initialize();

    // If the id doesn't look like a YouTube channel ID (UC...), search by name
    let artistId = id;
    if (!id.startsWith('UC') && !id.startsWith('MP')) {
      const searchResults = await yt.searchArtists(decodeURIComponent(id));
      if (!searchResults.length) {
        return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
      }
      artistId = searchResults[0].artistId;
    }

    const artist = await yt.getArtist(artistId);

    const songs = (artist.topSongs || []).slice(0, 30).map(song =>
      mapSong(song, artist.name, artistId)
    );

    return NextResponse.json({
      id: artistId,
      name: artist.name,
      thumbnails: artist.thumbnails,
      topAlbums: (artist.topAlbums || []).slice(0, 10).map(a => ({
        id: a.albumId,
        name: a.title || a.name,
        thumbnail: a.thumbnails?.[a.thumbnails.length - 1]?.url || '',
        year: a.year,
        type: 'Album'
      })),
      singles: (artist.topSingles || artist.singles || []).slice(0, 10).map(a => ({
        id: a.albumId,
        name: a.title || a.name,
        thumbnail: a.thumbnails?.[a.thumbnails.length - 1]?.url || '',
        year: a.year,
        type: 'Single'
      })),
      songs,
    });
  } catch (error) {
    console.error('Artist fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch artist', details: error.message }, { status: 500 });
  }
}

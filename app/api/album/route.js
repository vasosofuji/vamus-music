import YTMusic from 'ytmusic-api';
import { NextResponse } from 'next/server';

function mapSong(song, albumTitle) {
  return {
    id: song.videoId,
    title: song.name,
    url: `https://music.youtube.com/watch?v=${song.videoId}`,
    thumbnail: song.thumbnails?.[song.thumbnails.length - 1]?.url || '',
    durationRaw: song.duration
      ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
      : '',
    durationInSec: song.duration || 0,
    artistId: song.artist?.artistId || null,
    channel: {
      name: song.artist?.name || 'Unknown',
    },
    album: {
      name: albumTitle
    }
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
  }

  try {
    const yt = new YTMusic();
    await yt.initialize();
    
    const album = await yt.getAlbum(id);
    
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    const songs = (album.songs || []).map(song => mapSong(song, album.title));

    return NextResponse.json({
      id: album.albumId || id,
      name: album.title || album.name,
      thumbnails: album.thumbnails,
      year: album.year,
      type: album.type || 'Album',
      artist: album.artist,
      songs,
    });
  } catch (error) {
    console.error('Album fetch error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch album', details: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

// Multiple API sources to find audio stream URLs
const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.kavin.rocks',
];

const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://invidious.jing.rocks',
  'https://yewtu.be',
];

// Try Piped API to get audio stream URL
async function tryPiped(videoId) {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      
      const audioStreams = (data.audioStreams || [])
        .filter(s => s.mimeType && s.mimeType.startsWith('audio/'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioStreams.length > 0) {
        return { url: audioStreams[0].url, mimeType: audioStreams[0].mimeType };
      }
    } catch (e) {
      console.error(`Piped ${instance} failed:`, e.message);
    }
  }
  return null;
}

// Try Invidious API to get audio stream URL
async function tryInvidious(videoId) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();

      const audioFormats = (data.adaptiveFormats || [])
        .filter(f => f.type && f.type.startsWith('audio/'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioFormats.length > 0) {
        return { url: audioFormats[0].url, mimeType: audioFormats[0].type.split(';')[0] };
      }
    } catch (e) {
      console.error(`Invidious ${instance} failed:`, e.message);
    }
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    // Try all sources to find an audio stream URL
    let streamInfo = await tryPiped(id);
    if (!streamInfo) {
      streamInfo = await tryInvidious(id);
    }

    if (!streamInfo) {
      return NextResponse.json(
        { error: 'Could not find audio stream from any source.' },
        { status: 502 }
      );
    }

    // Redirect the browser to fetch audio directly from the CDN
    // The browser uses the user's residential IP (not blocked by YouTube)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': streamInfo.url,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json(
      { error: 'Failed to stream audio', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

// Piped instances to try as fallbacks (public YouTube proxies)
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.in.projectsegfau.lt',
];

async function getAudioStreamUrl(videoId) {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;

      const data = await res.json();
      // Get the best audio stream available
      const audioStreams = (data.audioStreams || [])
        .filter(s => s.mimeType && s.mimeType.startsWith('audio/'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioStreams.length > 0) {
        return {
          url: audioStreams[0].url,
          mimeType: audioStreams[0].mimeType,
        };
      }
    } catch (e) {
      console.error(`Piped instance ${instance} failed:`, e.message);
      continue;
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
    const streamInfo = await getAudioStreamUrl(id);

    if (!streamInfo) {
      return NextResponse.json(
        { error: 'Could not find audio stream. All proxy instances failed.' },
        { status: 502 }
      );
    }

    // Proxy the audio stream through our server to avoid CORS issues
    const audioRes = await fetch(streamInfo.url, {
      signal: AbortSignal.timeout(15000),
    });

    if (!audioRes.ok || !audioRes.body) {
      return NextResponse.json(
        { error: 'Failed to fetch audio stream from proxy' },
        { status: 502 }
      );
    }

    return new Response(audioRes.body, {
      headers: {
        'Content-Type': streamInfo.mimeType || 'audio/webm',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Accept-Ranges': 'none',
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

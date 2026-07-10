import play from 'play-dl';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    const url = `https://www.youtube.com/watch?v=${id}`;
    
    // play-dl gets the stream natively in Node (much less CPU than yt-dlp)
    // and naturally bypasses many bot checks by using mobile API endpoints.
    const stream = await play.stream(url, { discordPlayerCompatibility: true });

    return new Response(stream.stream, {
      headers: {
        'Content-Type': stream.type === 'opus' ? 'audio/ogg' : 'audio/webm',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Accept-Ranges': 'none',
      },
    });
  } catch (error) {
    console.error('play-dl Stream error:', error);
    return NextResponse.json({ error: 'Failed to stream audio', details: error.message }, { status: 500 });
  }
}

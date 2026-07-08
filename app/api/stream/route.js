import yt from 'youtube-dl-exec';
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

// Get the correct binary path dynamically based on the OS (Linux on Render)
const ytDlpPath = yt.constants.YOUTUBE_DL_PATH;

function nodeToWebStream(nodeStream, processRef) {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        try { controller.enqueue(new Uint8Array(chunk)); } catch {}
      });
      nodeStream.on('end', () => {
        try { controller.close(); } catch {}
      });
      nodeStream.on('error', (err) => {
        // ERR_INVALID_STATE means client disconnected — ignore it
        if (err.code !== 'ERR_INVALID_STATE') {
          console.error('Stream data error:', err.message);
          try { controller.error(err); } catch {}
        }
      });
    },
    cancel() {
      try { processRef.kill(); } catch(e) {}
    }
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    const url = `https://www.youtube.com/watch?v=${id}`;
    
    // Spawn yt-dlp directly using Node's spawn for maximum control
    // Use m4a format because audio/mp4 has the best browser compatibility
    const proc = spawn(ytDlpPath, [
      url,
      '--output', '-',
      '--format', 'bestaudio[ext=m4a]/bestaudio',
      '--quiet',
      '--no-warnings',
    ]);

    if (!proc || !proc.stdout) {
      throw new Error('Failed to spawn yt-dlp process');
    }

    proc.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.trim()) console.error('[yt-dlp stderr]', msg.trim());
    });

    const webStream = nodeToWebStream(proc.stdout, proc);

    return new Response(webStream, {
      headers: {
        'Content-Type': 'audio/mp4',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Accept-Ranges': 'none',
      },
    });
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json({ error: 'Failed to stream audio', details: error.message }, { status: 500 });
  }
}

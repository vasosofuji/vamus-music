import YTMusic from 'ytmusic-api';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const artistNames = (searchParams.get('artistNames') || '').split(',').filter(Boolean);

  if (!artistNames.length) return NextResponse.json([]);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No GEMINI_API_KEY found, falling back to basic recommendations');
    // Basic fallback if no key
    return fetchBasicRecs(artistNames);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      The user listens to these artists: ${artistNames.join(', ')}.
      Analyze their music genre, regional style, and vibe. Even if only one artist is provided, deduce the genre and style.
      Based on this deep analysis, recommend exactly 20 highly correlated artists that they would love, who are NOT in their current list.
      For each recommended artist, also provide their most iconic or fitting song title.
      Respond strictly in JSON format as an array of objects. Example:
      [
        { "artist": "Artist Name", "song": "Song Title" }
      ]
      Do not include any markdown formatting or extra text, just the raw JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let rawText = response.text.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/```/g, '').trim();
    }
    const recommendations = JSON.parse(rawText);

    const yt = new YTMusic();
    await yt.initialize();

    const finalRecs = [];
    
    // Resolve real YouTube Music IDs for the AI recommendations
    // Process them in parallel for speed
    await Promise.all(
      recommendations.map(async (rec) => {
        try {
          // Search for the specific song by the artist
          const query = `${rec.artist} ${rec.song}`;
          const songs = await yt.searchSongs(query);
          
          if (songs.length > 0) {
            const song = songs[0];
            finalRecs.push({
              id: song.videoId,
              title: song.name,
              url: `https://music.youtube.com/watch?v=${song.videoId}`,
              thumbnail: song.thumbnails?.[song.thumbnails.length - 1]?.url || '',
              durationRaw: song.duration
                ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
                : '',
              durationInSec: song.duration || 0,
              artistId: song.artist?.artistId || null,
              channel: { name: song.artist?.name || rec.artist }
            });
          }
        } catch (e) {
          console.error('Error resolving AI rec:', e.message);
        }
      })
    );

    // If AI lookup completely fails or returns nothing, fallback
    if (finalRecs.length === 0) {
      return fetchBasicRecs(artistNames);
    }

    return NextResponse.json(finalRecs);

  } catch (error) {
    console.error('AI Recommendations error:', error);
    return fetchBasicRecs(artistNames);
  }
}

async function fetchBasicRecs(artistNames) {
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
            const artistData = await yt.getArtist(a.artistId);
            if (artistData.topSongs && artistData.topSongs.length > 0) {
              const song = artistData.topSongs[0];
              recommended.push({
                id: song.videoId,
                title: song.name,
                url: `https://music.youtube.com/watch?v=${song.videoId}`,
                thumbnail: song.thumbnails?.[song.thumbnails.length - 1]?.url || '',
                durationRaw: song.duration
                  ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`
                  : '',
                durationInSec: song.duration || 0,
                artistId: song.artist?.artistId || a.artistId,
                channel: { name: song.artist?.name || a.name },
                aiReason: 'Similar artist recommendation'
              });
            }
          }
        }
      } catch {}
      if (recommended.length >= 5) break;
    }
    return NextResponse.json(recommended.slice(0, 5));
  } catch {
    return NextResponse.json([]);
  }
}

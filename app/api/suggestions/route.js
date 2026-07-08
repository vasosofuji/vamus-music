import YTMusic from 'ytmusic-api';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) return NextResponse.json([]);

  try {
    const yt = new YTMusic();
    await yt.initialize();
    const suggestions = await yt.getSearchSuggestions(query);
    const result = (suggestions || []).slice(0, 8).map(s =>
      typeof s === 'string' ? s : (s.suggestion || s.query || s.text || '')
    ).filter(Boolean);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Suggestions error:', error.message);
    return NextResponse.json([]);
  }
}

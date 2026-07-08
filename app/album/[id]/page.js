'use client';

import { use, useEffect, useState } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import TrackList from '@/components/TrackList';
import { Music2, Play, Shuffle } from 'lucide-react';
import '../../playlist/[id]/playlist.css'; // Reuse playlist CSS for layout

export default function AlbumPage({ params }) {
  const { id } = use(params);
  const { playTrack, setShuffle } = useMusic();
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/album?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setAlbum(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return (
    <>
      <div className="page-loader"><div className="spinner" /><span>Loading album...</span></div>
    </>
  );

  if (error || !album) return (
    <>
      <div className="empty-state" style={{ marginTop: '2rem' }}>
        <h3>Album not found</h3>
        <p>{error || 'Could not load this album'}</p>
      </div>
    </>
  );

  const headerThumb = album.thumbnails?.[album.thumbnails.length - 1]?.url;
  
  const playSongs = () => {
    if (!album.songs || album.songs.length === 0) return;
    playTrack(album.songs[0], album.songs);
  };

  const playShuffled = () => {
    if (!album.songs || album.songs.length === 0) return;
    setShuffle(true);
    const idx = Math.floor(Math.random() * album.songs.length);
    playTrack(album.songs[idx], album.songs);
  };

  return (
    <>
      <div className="playlist-page">
        {/* Hero */}
        <div className="playlist-hero banner-container">
          <div className="playlist-hero-icon logo-container" style={headerThumb ? { background: `url(${headerThumb})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!headerThumb && <Music2 size={60} />}
          </div>
          <div className="playlist-hero-info">
            <p className="playlist-label">{album.type || 'Album'} • {album.year || 'Unknown'}</p>
            <h1 className="playlist-name-title">{album.name}</h1>
            <p className="playlist-count">{album.artist?.name || 'Unknown Artist'} • {album.songs?.length || 0} songs</p>
          </div>
        </div>

        <div className="playlist-actions">
          <button className="action-btn primary" onClick={playSongs} disabled={!album.songs || album.songs.length === 0}>
            <Play size={20} fill="currentColor" /> Play
          </button>
          <button className="action-btn secondary" onClick={playShuffled} disabled={!album.songs || album.songs.length === 0}>
            <Shuffle size={18} /> Shuffle
          </button>
        </div>

        {album.songs && album.songs.length > 0 ? (
          <TrackList
            tracks={album.songs}
            onPlay={(t) => playTrack(t, album.songs)}
          />
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <Music2 size={48} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <h3>No songs available</h3>
            <p>We couldn't find any tracks for this album.</p>
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { use, useEffect, useState } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import TrackList from '@/components/TrackList';
import AlbumCard from '@/components/AlbumCard';
import { Play, Shuffle } from 'lucide-react';
import './artist.css';

export default function ArtistPage({ params }) {
  const { id } = use(params);
  const { playTrack, setShuffle } = useMusic();
  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/artist?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setArtist(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return (
    <>
      <div className="page-loader"><div className="spinner" /><span>Loading artist...</span></div>
    </>
  );

  if (error || !artist) return (
    <>
      <div className="empty-state">
        <h3>Artist not found</h3>
        <p>{error || 'Could not load this artist'}</p>
      </div>
    </>
  );

  const headerThumb = artist.thumbnails?.[artist.thumbnails.length - 1]?.url;

  return (
    <>
      <div className="artist-page">
        {/* Hero */}
        <div
          className="artist-hero"
          style={headerThumb ? { backgroundImage: `url(${headerThumb})` } : {}}
        >
          <div className="artist-hero-overlay" />
          <div className="artist-hero-content">
            {headerThumb && <img src={headerThumb} alt={artist.name} className="artist-avatar" />}
            <div>
              <p className="artist-label">Artist</p>
              <h1 className="artist-name">{artist.name}</h1>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="artist-actions">
          {artist.songs?.length > 0 && (
            <>
              <button
                className="action-btn primary"
                onClick={() => playTrack(artist.songs[0], artist.songs)}
              >
                <Play size={20} fill="currentColor" /> Play
              </button>
              <button
                className="action-btn secondary"
                onClick={() => { setShuffle(true); playTrack(artist.songs[Math.floor(Math.random() * artist.songs.length)], artist.songs); }}
              >
                <Shuffle size={18} /> Shuffle
              </button>
            </>
          )}
        </div>

        {/* Songs */}
        {artist.songs?.length > 0 ? (
          <section>
            <h2 className="section-title">Popular Songs</h2>
            <TrackList
              tracks={artist.songs}
              onPlay={(t) => playTrack(t, artist.songs)}
            />
          </section>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <h3>No songs found</h3>
            <p>This artist has no songs available</p>
          </div>
        )}

        {/* Albums */}
        {artist.topAlbums?.length > 0 && (
          <section style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Albums</h2>
            <div className="card-grid">
              {artist.topAlbums.map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {/* Singles */}
        {artist.singles?.length > 0 && (
          <section style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Singles & EPs</h2>
            <div className="card-grid">
              {artist.singles.map(single => (
                <AlbumCard key={single.id} album={single} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

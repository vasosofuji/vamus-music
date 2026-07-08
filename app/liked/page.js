'use client';

import { useMusic } from '@/app/context/MusicContext';
import TrackList from '@/components/TrackList';
import { Heart, Shuffle, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import './liked.css';

export default function LikedPage() {
  const { likedSongs, playTrack, setShuffle, toggleLike } = useMusic();
  const router = useRouter();

  const playSongs = () => {
    if (likedSongs.length === 0) return;
    playTrack(likedSongs[0], likedSongs);
  };

  const playShuffled = () => {
    if (likedSongs.length === 0) return;
    setShuffle(true);
    const idx = Math.floor(Math.random() * likedSongs.length);
    playTrack(likedSongs[idx], likedSongs);
  };

  return (
    <>
      <div className="liked-page">
        {/* Hero */}
        <div className="liked-hero">
          <div className="liked-hero-icon">
            <Heart size={64} fill="currentColor" />
          </div>
          <div>
            <p className="liked-label">Playlist</p>
            <h1 className="liked-title">Liked Songs</h1>
            <p className="liked-count">{likedSongs.length} songs</p>
          </div>
        </div>

        {likedSongs.length > 0 ? (
          <>
            <div className="artist-actions">
              <button className="action-btn primary" onClick={playSongs}>
                <Play size={20} fill="currentColor" /> Play
              </button>
              <button className="action-btn secondary" onClick={playShuffled}>
                <Shuffle size={18} /> Shuffle
              </button>
            </div>
            <TrackList
              tracks={likedSongs}
              onPlay={(t) => playTrack(t, likedSongs)}
              showRemove
              onRemove={(trackId) => {
                const track = likedSongs.find(t => t.id === trackId);
                if (track) toggleLike(track);
              }}
            />
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <Heart size={48} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <h3>No liked songs yet</h3>
            <p>Heart a song to save it here</p>
          </div>
        )}
      </div>
    </>
  );
}

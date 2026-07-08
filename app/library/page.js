'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMusic } from '@/app/context/MusicContext';
import { Heart, Music2, Plus } from 'lucide-react';
import localforage from 'localforage';
import PlaylistModal from '@/components/PlaylistModal';
import '../page.css'; // Reuse existing page CSS

function LibraryPlaylistIcon({ logoStyle }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (logoStyle?.startsWith('localforage:')) {
      const dbId = logoStyle.split(':')[1];
      localforage.getItem(dbId).then(data => setSrc(data || ''));
    } else {
      setSrc(logoStyle || '');
    }
  }, [logoStyle]);

  if (src) {
    return (
      <div 
        style={{ 
          width: '64px',
          height: '64px',
          background: src, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          borderRadius: '8px',
          flexShrink: 0
        }} 
      />
    );
  }

  return (
    <div style={{
      width: '64px',
      height: '64px',
      background: 'var(--surface-hover)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)',
      flexShrink: 0
    }}>
      <Music2 size={24} />
    </div>
  );
}

export default function LibraryPage() {
  const { playlists, likedSongs, createPlaylist } = useMusic();
  const [showModal, setShowModal] = useState(false);

  const handleCreatePlaylist = (name) => {
    createPlaylist(name);
    setShowModal(false);
  };

  return (
    <div className="home-page">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="home-greeting" style={{ marginBottom: 0 }}>Your Library</h1>
      </div>

      <div className="animate-fade-up">
        {/* Liked Songs Card */}
        <Link 
          href="/liked" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <Heart size={28} fill="currentColor" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Liked Songs</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
            </span>
          </div>
        </Link>

        <div className="section-title" style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Playlists</h2>
          <button
            className="btn-icon"
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--surface-hover)', borderRadius: '50%', padding: '0.4rem' }}
          >
            <Plus size={20} />
          </button>
        </div>
        
        {playlists.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any playlists yet.</p>
            <button 
              onClick={() => setShowModal(true)}
              style={{
                background: 'var(--primary-color)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} /> Create Playlist
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {playlists.map(pl => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  border: '1px solid transparent',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              >
                <LibraryPlaylistIcon logoStyle={pl.logoStyle} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pl.name}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Playlist · {pl.tracks.length} {pl.tracks.length === 1 ? 'song' : 'songs'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PlaylistModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreatePlaylist}
        />
      )}
    </div>
  );
}

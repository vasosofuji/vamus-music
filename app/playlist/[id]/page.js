'use client';

import { use, useState, useEffect } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import TrackList from '@/components/TrackList';
import { Music2, Play, Shuffle, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PlaylistModal from '@/components/PlaylistModal';
import BannerModal from '@/components/BannerModal';
import localforage from 'localforage';
import './playlist.css';

export default function PlaylistPage({ params }) {
  const { id } = use(params);
  const { playlists, playTrack, setShuffle, removeFromPlaylist, deletePlaylist, renamePlaylist, updatePlaylistBanner, updatePlaylistLogo } = useMusic();
  const router = useRouter();
  const [showRename, setShowRename] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  
  const [resolvedBanner, setResolvedBanner] = useState('');
  const [resolvedLogo, setResolvedLogo] = useState('');

  const playlist = playlists.find(p => p.id === id);

  useEffect(() => {
    if (playlist?.bannerStyle?.startsWith('localforage:')) {
      const dbId = playlist.bannerStyle.split(':')[1];
      localforage.getItem(dbId).then(data => setResolvedBanner(data));
    } else {
      setResolvedBanner(playlist?.bannerStyle || '');
    }

    if (playlist?.logoStyle?.startsWith('localforage:')) {
      const dbId = playlist.logoStyle.split(':')[1];
      localforage.getItem(dbId).then(data => setResolvedLogo(data));
    } else {
      setResolvedLogo(playlist?.logoStyle || '');
    }
  }, [playlist?.bannerStyle, playlist?.logoStyle]);

  if (!playlist) {
    return (
      <>
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <h3>Playlist not found</h3>
          <p>This playlist may have been deleted</p>
        </div>
      </>
    );
  }

  const playSongs = () => {
    if (playlist.tracks.length === 0) return;
    playTrack(playlist.tracks[0], playlist.tracks);
  };

  const playShuffled = () => {
    if (playlist.tracks.length === 0) return;
    setShuffle(true);
    const idx = Math.floor(Math.random() * playlist.tracks.length);
    playTrack(playlist.tracks[idx], playlist.tracks);
  };

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    router.push('/');
  };

  return (
    <>
      <div className="playlist-page">
        {/* Hero */}
        <div className="playlist-hero banner-container" style={resolvedBanner ? { background: resolvedBanner, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          <div className="hover-overlay banner-edit-overlay" onClick={() => setShowBannerModal(true)}>
            <ImageIcon size={24} /> <span>Edit Banner</span>
          </div>

          <div className="playlist-hero-icon logo-container" style={resolvedLogo ? { background: resolvedLogo, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!resolvedLogo && <Music2 size={60} />}
            <div className="hover-overlay logo-edit-overlay" onClick={(e) => { e.stopPropagation(); setShowLogoModal(true); }}>
              <Pencil size={20} />
            </div>
          </div>
          <div className="playlist-hero-info">
            <p className="playlist-label">Playlist</p>
            <h1 className="playlist-name-title">{playlist.name}</h1>
            <p className="playlist-count">{playlist.tracks.length} songs</p>
          </div>
        </div>

        <div className="playlist-actions">
          <button className="action-btn primary" onClick={playSongs} disabled={playlist.tracks.length === 0}>
            <Play size={20} fill="currentColor" /> Play
          </button>
          <button className="action-btn secondary" onClick={playShuffled} disabled={playlist.tracks.length === 0}>
            <Shuffle size={18} /> Shuffle
          </button>
          <button className="action-btn secondary" onClick={() => setShowRename(true)}>
            <Pencil size={16} /> Rename
          </button>
          <button className="action-btn danger" onClick={handleDelete}>
            <Trash2 size={16} /> Delete
          </button>
        </div>

        {playlist.tracks.length > 0 ? (
          <TrackList
            tracks={playlist.tracks}
            onPlay={(t) => playTrack(t, playlist.tracks)}
            showRemove
            onRemove={(trackId) => removeFromPlaylist(playlist.id, trackId)}
          />
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <Music2 size={48} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <h3>This playlist is empty</h3>
            <p>Search for songs and add them here from the ••• menu</p>
          </div>
        )}

        {showRename && (
          <PlaylistModal
            initialName={playlist.name}
            onClose={() => setShowRename(false)}
            onCreate={(name) => { renamePlaylist(playlist.id, name); setShowRename(false); }}
          />
        )}

        {showBannerModal && (
          <BannerModal
            initialBanner={playlist.bannerStyle}
            onClose={() => setShowBannerModal(false)}
            onSave={(style) => { updatePlaylistBanner(playlist.id, style); setShowBannerModal(false); }}
          />
        )}

        {showLogoModal && (
          <BannerModal
            initialBanner={playlist.logoStyle}
            onClose={() => setShowLogoModal(false)}
            onSave={(style) => { updatePlaylistLogo(playlist.id, style); setShowLogoModal(false); }}
          />
        )}
      </div>
    </>
  );
}

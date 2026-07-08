'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, Plus, Music2, Trash2, MoreHorizontal, Settings } from 'lucide-react';
import { useMusic } from '@/app/context/MusicContext';
import PlaylistModal from './PlaylistModal';
import localforage from 'localforage';
import { useEffect } from 'react';
import './Sidebar.css';

function SidebarPlaylistIcon({ logoStyle }) {
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
        className="playlist-icon" 
        style={{ 
          background: src, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          borderRadius: '4px' // or whatever styling you prefer
        }} 
      />
    );
  }

  return (
    <div className="playlist-icon">
      <Music2 size={14} />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { playlists, createPlaylist, deletePlaylist } = useMusic();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null); // playlist id with open menu

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/liked', icon: Heart, label: 'Liked Songs' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleCreatePlaylist = (name) => {
    createPlaylist(name);
    setShowModal(false);
  };

  return (
    <aside className="sidebar glass-panel">
      <Link href="/" className="sidebar-logo" onClick={() => window.dispatchEvent(new CustomEvent('clear-search'))} style={{ textDecoration: 'none' }}>
        <Music2 size={22} />
        <h2>Vamus</h2>
      </Link>

      <nav className="sidebar-nav">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${pathname === href ? 'active' : ''}`}
            onClick={(e) => {
              if (href === '/') window.dispatchEvent(new CustomEvent('clear-search'));
            }}
          >
            <Icon size={20} />
            <span className="nav-label">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-library">
        <div className="library-header">
          <span>Your Library</span>
          <button
            className="btn-icon add-btn"
            onClick={() => setShowModal(true)}
            title="Create playlist"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="playlist-list">
          {playlists.length === 0 ? (
            <div className="library-empty">
              <p>Create your first playlist</p>
              <button className="create-btn" onClick={() => setShowModal(true)}>
                <Plus size={16} /> New Playlist
              </button>
            </div>
          ) : (
            playlists.map(pl => (
              <div key={pl.id} className="playlist-item-wrapper">
                <Link
                  href={`/playlist/${pl.id}`}
                  className={`playlist-item ${pathname === `/playlist/${pl.id}` ? 'active' : ''}`}
                >
                  <SidebarPlaylistIcon logoStyle={pl.logoStyle} />
                  <div className="playlist-info">
                    <span className="playlist-name">{pl.name}</span>
                    <span className="playlist-meta">Playlist · {pl.tracks.length} songs</span>
                  </div>
                </Link>
                <button
                  className="btn-icon playlist-menu-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuOpen(menuOpen?.id === pl.id ? null : { id: pl.id, x: rect.right, y: rect.bottom });
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
                {menuOpen?.id === pl.id && (
                  <div className="playlist-dropdown" style={{ left: menuOpen.x + 10, top: menuOpen.y }}>
                    <button
                      className="playlist-dropdown-item danger"
                      onClick={() => { deletePlaylist(pl.id); setMenuOpen(null); }}
                    >
                      <Trash2 size={14} /> Delete playlist
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <PlaylistModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreatePlaylist}
        />
      )}
    </aside>
  );
}

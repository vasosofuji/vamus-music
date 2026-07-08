'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Play, Clock, Heart, MoreHorizontal, Plus, Check } from 'lucide-react';
import { useMusic } from '@/app/context/MusicContext';
import './TrackList.css';

function ContextMenu({ track, onClose, anchorPos }) {
  const { playlists, addToPlaylist, isLiked, toggleLike, createPlaylist } = useMusic();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ top: anchorPos.y, left: anchorPos.x }}
    >
      <div className="context-menu-item" onClick={() => { toggleLike(track); onClose(); }}>
        <Heart size={16} fill={isLiked(track.id) ? 'currentColor' : 'none'} />
        {isLiked(track.id) ? 'Remove from Liked' : 'Like Song'}
      </div>
      <div className="context-menu-separator" />
      {playlists.map(pl => (
        <div
          key={pl.id}
          className="context-menu-item"
          onClick={() => { addToPlaylist(pl.id, track); onClose(); }}
        >
          {pl.tracks.some(t => t.id === track.id) ? <Check size={16} /> : <Plus size={16} />}
          Add to: {pl.name}
        </div>
      ))}
      {playlists.length === 0 && (
        <div className="context-menu-item" style={{ color: 'var(--text-secondary)', cursor: 'default' }}>
          No playlists yet
        </div>
      )}
    </div>
  );
}

export default function TrackList({ tracks, onPlay, showRemove, onRemove }) {
  const { toggleLike, isLiked } = useMusic();
  const [contextMenu, setContextMenu] = useState(null); // { track, x, y }

  if (!tracks || tracks.length === 0) return null;

  const openMenu = (e, track) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ track, x: rect.left, y: rect.bottom + 4 });
  };

  return (
    <div className="track-list">
      <div className="track-list-header">
        <div className="col-index">#</div>
        <div className="col-title">Title</div>
        <div className="col-album">Artist</div>
        <div className="col-actions"></div>
        <div className="col-time"><Clock size={15} /></div>
      </div>

      <div className="track-list-body">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="track-row animate-fade-up"
            style={{ animationDelay: `${Math.min(index * 0.04, 0.5)}s` }}
            onClick={() => onPlay(track)}
          >
            <div className="col-index">
              <span className="index-num">{index + 1}</span>
              <button className="row-play-btn"><Play size={14} fill="currentColor" /></button>
            </div>
            <div className="col-title">
              <img src={track.thumbnail} alt={track.title} className="row-thumb" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E"; }} />
              <span className="row-name">{track.title}</span>
            </div>
            <div className="col-album">
              {track.channel?.name ? (
                <Link
                  href={`/artist/${track.artistId || encodeURIComponent(track.channel.name)}`}
                  className="artist-link"
                  onClick={e => e.stopPropagation()}
                >
                  {track.channel.name}
                </Link>
              ) : 'Unknown'}
            </div>
            <div className="col-actions" onClick={e => e.stopPropagation()}>
              <button
                className={`btn-icon like-btn ${isLiked(track.id) ? 'active' : ''}`}
                onClick={() => toggleLike(track)}
                title={isLiked(track.id) ? 'Unlike' : 'Like'}
              >
                <Heart size={16} fill={isLiked(track.id) ? 'currentColor' : 'none'} />
              </button>
              {showRemove && (
                <button
                  className="btn-icon danger"
                  onClick={() => onRemove && onRemove(track.id)}
                  title="Remove"
                >
                  ✕
                </button>
              )}
              <button
                className="btn-icon more-btn"
                onClick={(e) => openMenu(e, track)}
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="col-time">{track.durationRaw}</div>
          </div>
        ))}
      </div>

      {contextMenu && (
        <ContextMenu
          track={contextMenu.track}
          anchorPos={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

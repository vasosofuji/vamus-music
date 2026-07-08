'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, Heart, MoreHorizontal, Plus, Check, Mic, ChevronDown
} from 'lucide-react';
import { useMusic } from '@/app/context/MusicContext';
import LyricsModal from './LyricsModal';
import Link from 'next/link';
import './Player.css';

export default function Player() {
  const {
    currentTrack, isPlaying, setIsPlaying,
    playNext, playPrev, shuffle, setShuffle,
    repeat, setRepeat, toggleLike, isLiked,
    playlists, addToPlaylist
  } = useMusic();

  const [contextMenu, setContextMenu] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const latestPlayNext = useRef(playNext);

  useEffect(() => {
    latestPlayNext.current = playNext;
  }, [playNext]);

  // When track changes, load + play it
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    let timeoutId;
    
    audioRef.current.src = `/api/stream?id=${currentTrack.id}`;
    audioRef.current.load();
    audioRef.current.play().catch(e => {
      console.error('Play error:', e);
      if (e.name === 'AbortError') return;
      // Skip to next song if this one fails to play (e.g., stream error)
      timeoutId = setTimeout(() => latestPlayNext.current(), 1500);
    });
    setIsPlaying(true);
    setProgress(0);

    return () => clearTimeout(timeoutId);
  }, [currentTrack?.id]);

  // Sync play/pause state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setProgress(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const handleVolumeChange = (e) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const toggleVolume = () => {
    const newVol = volume > 0 ? 0 : 1;
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const cycleRepeat = () => {
    setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none');
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  const openMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ 
      left: rect.left, 
      top: rect.top, 
      bottom: rect.bottom, 
      right: rect.right 
    });
  };

  const closeMenu = () => setContextMenu(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (contextMenu && !e.target.closest('.context-menu')) closeMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  return (
    <>
      {isExpanded && currentTrack && (
        <div className="mobile-player-overlay">
          <div className="mobile-player-header">
            <button className="btn-icon" onClick={() => setIsExpanded(false)}>
              <ChevronDown size={28} />
            </button>
            <span className="mobile-player-title">Now Playing</span>
            <button className="btn-icon" onClick={openMenu}>
              <MoreHorizontal size={24} />
            </button>
          </div>
          
          <img src={currentTrack.thumbnail} alt="cover" className="mobile-player-art" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E"; }} />
          
          <div className="mobile-player-info">
            <div className="mobile-player-track-info">
              <h2>{currentTrack.title}</h2>
              <p>{currentTrack.channel?.name || 'Unknown'}</p>
            </div>
            <button
              className={`btn-icon like-btn ${isLiked(currentTrack.id) ? 'active' : ''}`}
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart size={24} fill={isLiked(currentTrack.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mobile-player-progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              <input
                type="range"
                className="progress-input"
                min={0}
                max={duration || 100}
                step={0.1}
                value={progress}
                onChange={handleSeek}
              />
            </div>
            <div className="mobile-time-labels">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="mobile-player-controls">
            <button className={`btn-icon ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(s => !s)}>
              <Shuffle size={24} />
            </button>
            <button className="btn-icon" onClick={playPrev}>
              <SkipBack size={32} />
            </button>
            <button className="play-btn large" onClick={togglePlay}>
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button className="btn-icon" onClick={playNext}>
              <SkipForward size={32} />
            </button>
            <button className={`btn-icon ${repeat !== 'none' ? 'active' : ''}`} onClick={cycleRepeat}>
              {repeat === 'one' ? <Repeat1 size={24} /> : <Repeat size={24} />}
            </button>
          </div>
          
          <div className="mobile-player-footer">
            <button className={`btn-icon ${showLyrics ? 'active' : ''}`} onClick={() => setShowLyrics(s => !s)}>
              <Mic size={24} />
            </button>
          </div>
        </div>
      )}

      <div 
        className={`player-bar glass-panel ${isExpanded ? 'hidden-on-mobile' : ''}`}
        onClick={(e) => {
          if(e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return;
          if (window.innerWidth <= 600) setIsExpanded(true);
        }}
      >
        <audio
          ref={audioRef}
          loop={repeat === 'one'}
          onTimeUpdate={handleTimeUpdate}
          onEnded={playNext}
          onError={() => {
            console.error("Audio playback error");
            setTimeout(() => playNext(), 1500);
          }}
          onLoadedMetadata={handleTimeUpdate}
        />

        {/* Track info */}
        <div className="player-track">
        {currentTrack ? (
          <>
            <img src={currentTrack.thumbnail} alt="cover" className="player-thumb" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E"; }} />
            <div className="player-track-info">
              <span className="player-track-name">{currentTrack.title}</span>
              {currentTrack.artistId || currentTrack.channel?.name ? (
                <Link
                  href={`/artist/${currentTrack.artistId || encodeURIComponent(currentTrack.channel?.name)}`}
                  className="player-track-artist"
                  style={{ textDecoration: 'none' }}
                >
                  {currentTrack.channel?.name || 'Unknown'}
                </Link>
              ) : (
                <span className="player-track-artist">Unknown</span>
              )}
            </div>
            <button
              className={`btn-icon like-btn ${isLiked(currentTrack.id) ? 'active' : ''}`}
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart size={18} fill={isLiked(currentTrack.id) ? 'currentColor' : 'none'} />
            </button>
            <button className="btn-icon" onClick={openMenu} title="More options">
              <MoreHorizontal size={18} />
            </button>
          </>
        ) : (
          <div className="player-empty">Pick a song to play</div>
        )}
      </div>

      {/* Mini Player Progress Bar (Mobile Only) */}
      {!isExpanded && currentTrack && (
        <div 
          className="mini-progress-bar"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: '100%',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '0 0 8px 8px',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <div 
            style={{ 
              height: '100%', 
              width: `${progressPct}%`, 
              background: 'var(--primary-color)',
              transition: 'width 0.1s linear'
            }} 
          />
        </div>
      )}

      <div className="player-center">
        <div className="player-buttons">
          <button
            className={`btn-icon ${shuffle ? 'active' : ''}`}
            onClick={() => setShuffle(s => !s)}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button className="btn-icon" onClick={playPrev} title="Previous">
            <SkipBack size={20} />
          </button>
          <button className="play-btn" onClick={togglePlay}>
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>
          <button className="btn-icon" onClick={playNext} title="Next">
            <SkipForward size={20} />
          </button>
          <button
            className={`btn-icon ${repeat !== 'none' ? 'active' : ''}`}
            onClick={cycleRepeat}
            title={`Repeat: ${repeat}`}
          >
            {repeat === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        <div className="player-progress">
          <span className="time-label">{formatTime(progress)}</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            <input
              type="range"
              className="progress-input"
              min={0}
              max={duration || 100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
            />
          </div>
          <span className="time-label">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume and Extra Controls */}
      <div className="player-volume">
        <button className={`btn-icon ${showLyrics ? 'active' : ''}`} onClick={() => setShowLyrics(s => !s)} title="Toggle Lyrics">
          <Mic size={18} />
        </button>
        <button className="btn-icon volume-btn" onClick={toggleVolume}>
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          className="volume-input"
          min={0} max={1} step={0.01}
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
      </div>

      {/* Context Menu */}
      {contextMenu && currentTrack && (
        <div
          className="context-menu"
          style={
            contextMenu.top > window.innerHeight / 2
              ? { 
                  bottom: window.innerHeight - contextMenu.top + 8, 
                  right: window.innerWidth <= 600 ? window.innerWidth - contextMenu.right : 'auto',
                  left: window.innerWidth <= 600 ? 'auto' : contextMenu.left, 
                  top: 'auto', 
                  zIndex: 3000 
                }
              : { 
                  top: contextMenu.bottom + 8, 
                  right: window.innerWidth <= 600 ? window.innerWidth - contextMenu.right : 'auto',
                  left: window.innerWidth <= 600 ? 'auto' : contextMenu.left, 
                  bottom: 'auto', 
                  zIndex: 3000 
                }
          }
        >
          <div className="context-menu-item" onClick={() => { toggleLike(currentTrack); closeMenu(); }}>
            <Heart size={16} fill={isLiked(currentTrack.id) ? 'currentColor' : 'none'} />
            {isLiked(currentTrack.id) ? 'Remove from Liked' : 'Like Song'}
          </div>
          <div className="context-menu-separator" />
          {playlists.map(pl => (
            <div
              key={pl.id}
              className="context-menu-item"
              onClick={() => { addToPlaylist(pl.id, currentTrack); closeMenu(); }}
            >
              {pl.tracks.some(t => t.id === currentTrack.id) ? <Check size={16} /> : <Plus size={16} />}
              Add to: {pl.name}
            </div>
          ))}
          {playlists.length === 0 && (
            <div className="context-menu-item" style={{ color: 'var(--text-secondary)', cursor: 'default' }}>
              No playlists yet
            </div>
          )}
        </div>
      )}

      {/* Lyrics Modal Overlay */}
      {showLyrics && currentTrack && (
        <LyricsModal 
          track={currentTrack} 
          progress={progress} 
          onSeek={(time) => {
            setProgress(time);
            if (audioRef.current) audioRef.current.currentTime = time;
          }} 
          onClose={() => setShowLyrics(false)} 
        />
      )}
    </>
  );
}

'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import localforage from 'localforage';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none' | 'all' | 'one'
  const audioRef = useRef(null);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const liked = JSON.parse(localStorage.getItem('likedSongs') || '[]');
      const pls = JSON.parse(localStorage.getItem('playlists') || '[]');
      const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      setLikedSongs(liked);
      setPlaylists(pls);
      setRecentlyPlayed(recent);
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, []);

  // Persist liked songs
  useEffect(() => {
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  // Persist playlists
  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists]);

  // Persist recently played
  useEffect(() => {
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  const playTrack = useCallback((track, newQueue = null, isGoingBack = false) => {
    if (currentTrack && !isGoingBack && currentTrack.id !== track.id) {
      setHistory(h => [...h, currentTrack]);
    }
    setCurrentTrack(track);
    
    setIsPlaying(true);
    
    if (newQueue) {
      setQueue(newQueue);
      if (!isGoingBack) setHistory([]); // Clear history when starting a new context
    }

    // Add to recently played (keep last 30, deduplicated)
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 30);
    });
  }, [currentTrack]);

  const toggleLike = useCallback((track) => {
    setLikedSongs(prev => {
      const isLiked = prev.some(t => t.id === track.id);
      if (isLiked) return prev.filter(t => t.id !== track.id);
      return [track, ...prev];
    });
  }, []);

  const isLiked = useCallback((trackId) => {
    return likedSongs.some(t => t.id === trackId);
  }, [likedSongs]);

  const createPlaylist = useCallback((name) => {
    const newPlaylist = {
      id: `pl_${Date.now()}`,
      name,
      tracks: [],
      createdAt: Date.now(),
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist.id;
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  }, []);

  const renamePlaylist = useCallback((playlistId, newName) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, name: newName } : p));
  }, []);

  const updatePlaylistBanner = useCallback(async (playlistId, bannerStyle) => {
    let finalStyle = bannerStyle;
    if (bannerStyle && bannerStyle.startsWith('url(data:image')) {
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await localforage.setItem(id, bannerStyle);
      finalStyle = `localforage:${id}`;
    }
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, bannerStyle: finalStyle } : p));
  }, []);

  const updatePlaylistLogo = useCallback(async (playlistId, logoStyle) => {
    let finalStyle = logoStyle;
    if (logoStyle && logoStyle.startsWith('url(data:image')) {
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await localforage.setItem(id, logoStyle);
      finalStyle = `localforage:${id}`;
    }
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, logoStyle: finalStyle } : p));
  }, []);

  const addToPlaylist = useCallback((playlistId, track) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      if (p.tracks.some(t => t.id === track.id)) return p; // already in
      return { ...p, tracks: [...p.tracks, track] };
    }));
  }, []);

  const removeFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
    }));
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    
    if (shuffle) {
      const others = queue.filter(t => t.id !== currentTrack.id);
      if (others.length === 0) return;
      const next = others[Math.floor(Math.random() * others.length)];
      playTrack(next);
      return;
    }
    if (idx < queue.length - 1) {
      playTrack(queue[idx + 1]);
    } else if (repeat === 'all') {
      playTrack(queue[0]);
    } else {
      // Autoplay infinite radio
      const artistQuery = currentTrack.artistId || currentTrack.channel?.name;
      if (artistQuery) {
        fetch(`/api/artist?id=${encodeURIComponent(artistQuery)}`)
          .then(r => r.json())
          .then(data => {
            if (data.songs && data.songs.length > 0) {
              const unplayed = data.songs.filter(s => !queue.some(qt => qt.id === s.id));
              const nextTrack = unplayed.length > 0 ? unplayed[0] : data.songs[Math.floor(Math.random() * data.songs.length)];
              setQueue(q => [...q, nextTrack]);
              playTrack(nextTrack);
            }
          }).catch(console.error);
      }
    }
  }, [currentTrack, queue, shuffle, repeat, playTrack]);

  const playPrev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    
    setHistory(h => {
      if (h.length > 0) {
        const prevTrack = h[h.length - 1];
        setTimeout(() => playTrack(prevTrack, queue, true), 0);
        return h.slice(0, -1);
      }
      
      const idx = queue.findIndex(t => t.id === currentTrack.id);
      if (idx > 0) {
        setTimeout(() => playTrack(queue[idx - 1], queue, true), 0);
      }
      return h;
    });
  }, [currentTrack, queue, playTrack]);

  return (
    <MusicContext.Provider value={{
      currentTrack, setCurrentTrack,
      queue, setQueue,
      isPlaying, setIsPlaying,
      likedSongs, toggleLike, isLiked,
      playlists, createPlaylist, deletePlaylist, renamePlaylist, updatePlaylistBanner, updatePlaylistLogo, addToPlaylist, removeFromPlaylist,
      recentlyPlayed,
      shuffle, setShuffle,
      repeat, setRepeat,
      playTrack, playNext, playPrev,
      audioRef,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}

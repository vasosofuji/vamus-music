'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import TrackList from '@/components/TrackList';
import ArtistCard from '@/components/ArtistCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Music2 } from 'lucide-react';
import './page.css';


function RecentCard({ track, onPlay }) {
  return (
    <div className="recent-card" onClick={() => onPlay(track)}>
      <img src={track.thumbnail} alt={track.title} className="recent-thumb" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E"; }} />
      <span className="recent-title">{track.title}</span>
      <span className="recent-artist">{track.channel?.name}</span>
    </div>
  );
}

const GENRES = [
  { id: 'pop', name: 'Pop', color: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' },
  { id: 'rock', name: 'Rock', color: 'linear-gradient(135deg, #4A00E0, #8E2DE2)' },
  { id: 'hiphop', name: 'Hip Hop', color: 'linear-gradient(135deg, #11998E, #38EF7D)' },
  { id: 'electronic', name: 'Electronic', color: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
  { id: 'rnb', name: 'R&B', color: 'linear-gradient(135deg, #cc2b5e, #753a88)' },
  { id: 'jazz', name: 'Jazz', color: 'linear-gradient(135deg, #B79891, #94716B)' },
  { id: 'classical', name: 'Classical', color: 'linear-gradient(135deg, #141E30, #243B55)' },
  { id: 'indie', name: 'Indie', color: 'linear-gradient(135deg, #3a7bd5, #3a6073)' },
  { id: 'country', name: 'Country', color: 'linear-gradient(135deg, #f2994a, #f2c94c)' },
  { id: 'metal', name: 'Metal', color: 'linear-gradient(135deg, #4b6cb7, #182848)' },
];

export default function Home() {
  const { recentlyPlayed, likedSongs, playTrack, playlists } = useMusic();
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const router = useRouter();

  const recentGridRef = useRef(null);

  // Get unique artist names from recently played
  const uniqueArtistNames = [
    ...new Set(
      recentlyPlayed
        .map(t => t.channel?.name)
        .filter(Boolean)
    )
  ].slice(0, 5);

  useEffect(() => {
    if (uniqueArtistNames.length === 0) return;
    setIsLoadingRecs(true);
    fetch(`/api/ai-recommend?artistNames=${encodeURIComponent(uniqueArtistNames.join(','))}`)
      .then(r => r.json())
      .then(data => setRecommendedTracks(Array.isArray(data) ? data : []))
      .catch(() => setRecommendedTracks([]))
      .finally(() => setIsLoadingRecs(false));
  }, [recentlyPlayed.length]);

  useEffect(() => {
    const grid = recentGridRef.current;
    if (!grid) return;
    
    let targetScroll = grid.scrollLeft;
    let animationFrameId = null;
    let isLocked = false;
    let unlockTimeout = null;
    
    // Global listener to detect if the page is actively being scrolled
    let lastGlobalWheelTime = 0;
    const globalWheelHandler = () => { lastGlobalWheelTime = Date.now(); };
    window.addEventListener('wheel', globalWheelHandler, { passive: true });
    
    const handleMouseEnter = () => {
      if (Date.now() - lastGlobalWheelTime < 100) {
        isLocked = true; // User scrolled into this section; lock horizontal scroll
      }
    };

    const animate = () => {
      const currentScroll = grid.scrollLeft;
      const diff = targetScroll - currentScroll;
      
      if (Math.abs(diff) < 0.5) {
        grid.scrollLeft = targetScroll;
        animationFrameId = null;
      } else {
        grid.scrollLeft += diff * 0.08; // Softer smoothness factor
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    const handleWheel = (e) => {
      if (isLocked) {
        clearTimeout(unlockTimeout);
        unlockTimeout = setTimeout(() => { isLocked = false; }, 150);
        return; // Allow native vertical momentum to continue naturally
      }
      
      // Let native trackpad horizontal scrolling pass through
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      if (e.deltaY !== 0) {
        e.preventDefault();
        
        if (!animationFrameId) {
          targetScroll = grid.scrollLeft;
        }
        
        targetScroll = Math.max(0, Math.min(targetScroll + e.deltaY * 0.85, grid.scrollWidth - grid.clientWidth));
        
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };
    
    grid.addEventListener('mouseenter', handleMouseEnter);
    grid.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', globalWheelHandler);
      grid.removeEventListener('mouseenter', handleMouseEnter);
      grid.removeEventListener('wheel', handleWheel);
      clearTimeout(unlockTimeout);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [recentlyPlayed.length]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };



  return (
    <>
      <div className="home-page">
        {/* Top Header with Greeting */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h1 className="home-greeting" style={{ marginBottom: 0 }}>{greeting()}</h1>
        </div>

        {/* NORMAL HOME PAGE VIEW */}
        <div className="home-default-view animate-fade-up" style={{ paddingTop: '1.5rem' }}>
            {/* Quick picks row */}
            {(likedSongs.length > 0 || playlists.length > 0) && (
              <div className="quick-row">
                {likedSongs.length > 0 && (
                  <Link href="/liked" className="quick-card liked-card">
                    <div className="quick-card-icon">
                      <Heart size={22} fill="currentColor" />
                    </div>
                    <div className="quick-card-text">
                      <span>Liked Songs</span>
                      <small>{likedSongs.length} songs</small>
                    </div>
                  </Link>
                )}
                {playlists.map(pl => (
                  <Link key={pl.id} href={`/playlist/${pl.id}`} className="quick-card playlist-card">
                    <div className="quick-card-icon">
                      <Music2 size={22} />
                    </div>
                    <div className="quick-card-text">
                      <span>{pl.name}</span>
                      <small>{pl.tracks.length} songs</small>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Recently played */}
            {recentlyPlayed.length > 0 && (
              <section style={{ marginTop: '2.5rem' }}>
                <h2 className="section-title">Recently Played</h2>
                <div className="recent-grid" ref={recentGridRef}>
                  {recentlyPlayed.slice(0, 30).map(track => (
                    <RecentCard
                      key={track.id}
                      track={track}
                      onPlay={(t) => playTrack(t, recentlyPlayed)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recommended Tracks */}
            {(isLoadingRecs || recommendedTracks.length > 0) && (
              <section style={{ marginTop: '2.5rem' }}>
                <h2 className="section-title">AI Picks For You</h2>
                {isLoadingRecs ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Analyzing your taste...
                  </div>
                ) : (
                  <div className="ai-recs-container">
                    <TrackList
                      tracks={recommendedTracks}
                      onPlay={(t) => playTrack(t, recommendedTracks)}
                    />
                  </div>
                )}
              </section>
            )}

            {/* Explore Genres */}
            <section style={{ marginTop: '2.5rem' }}>
              <h2 className="section-title">Explore Genres</h2>
              <div className="genre-grid">
                {GENRES.map(genre => (
                  <div
                    key={genre.id}
                    className="genre-card"
                    style={{ background: genre.color }}
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(genre.name)}`);
                    }}
                  >
                    {genre.name}
                  </div>
                ))}
              </div>
            </section>

            {recentlyPlayed.length === 0 && (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <Music2 size={48} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                <h3>Welcome to Vamus</h3>
                <p>Search for songs and artists using the top right bar to get started</p>
              </div>
            )}
          </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMusic } from '@/app/context/MusicContext';
import TrackList from '@/components/TrackList';
import ArtistCard from '@/components/ArtistCard';
import { Music2 } from 'lucide-react';
import '../page.css'; // Reuse existing page CSS

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const router = useRouter();
  
  const { playTrack } = useMusic();
  const [activeTab, setActiveTab] = useState('songs');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchAbortController = useRef(null);

  const runSearch = useCallback(async (queryToSearch, tab = activeTab) => {
    if (!queryToSearch?.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    const abortController = new AbortController();
    searchAbortController.current = abortController;
    
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryToSearch)}&type=${tab}`, {
        signal: abortController.signal
      });
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name === 'AbortError') return;
      setSearchResults([]);
    } finally {
      if (searchAbortController.current === abortController) {
        setIsSearching(false);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (q) {
      runSearch(q, activeTab);
    } else {
      setSearchResults([]);
    }
  }, [q, activeTab, runSearch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const [mobileQuery, setMobileQuery] = useState(q || '');

  const debouncedMobileSearch = useDebounce((val) => {
    if (val.trim()) {
      router.push(`/search?q=${encodeURIComponent(val)}`);
    } else {
      router.push('/search');
    }
  }, 400);

  return (
    <div className="home-page">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 className="home-greeting" style={{ marginBottom: 0 }}>
          {q ? `Search Results for "${q}"` : 'Search'}
        </h1>
        
        {/* Mobile Search Input */}
        <div className="mobile-only-search" style={{ width: '100%' }}>
          <input
            type="text"
            value={mobileQuery}
            onChange={(e) => {
              setMobileQuery(e.target.value);
              debouncedMobileSearch(e.target.value);
            }}
            placeholder="Search songs, artists..."
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              borderRadius: '30px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
      </div>
      <div className="search-results-view animate-fade-up" style={{ marginTop: '2.5rem' }}>
        <div className="chip-tabs" style={{ width: '100%', marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
          {['songs', 'artists'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`chip ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {isSearching && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> 
            <span>Searching...</span>
          </div>
        )}

        {!isSearching && q && searchResults.length === 0 && (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>Try a different search term</p>
          </div>
        )}

        {!isSearching && !q && (
          <div className="empty-state">
            <Music2 size={48} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <h3>Search Vamus</h3>
            <p>Type in the search bar above to find songs and artists</p>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && activeTab === 'songs' && (
          <TrackList tracks={searchResults} onPlay={(t) => playTrack(t, searchResults)} />
        )}

        {!isSearching && searchResults.length > 0 && activeTab === 'artists' && (
          <div className="card-grid">
            {searchResults.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="home-page"><div className="spinner" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

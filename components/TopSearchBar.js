'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

function TopSearchBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const initialQuery = pathname === '/search' ? (searchParams.get('q') || '') : '';
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const suggestionsAbortController = useRef(null);

  // Sync with URL when navigating
  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    
    if (pathname === '/search') {
      setQuery(searchParams.get('q') || '');
    } else {
      setQuery('');
    }
  }, [pathname, searchParams]);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    if (suggestionsAbortController.current) suggestionsAbortController.current.abort();
    const abortController = new AbortController();
    suggestionsAbortController.current = abortController;
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`, {
        signal: abortController.signal
      });
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name === 'AbortError') return;
      setSuggestions([]);
    }
  }, []);

  const debouncedFetchSuggestions = useDebounce(fetchSuggestions, 280);

  useEffect(() => {
    debouncedFetchSuggestions(query);
  }, [query, debouncedFetchSuggestions]);

  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const debouncedRunSearch = useDebounce((q) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      if (pathname === '/search') {
        router.push('/');
      }
    }
  }, 400);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (s) => {
    setQuery(s);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(s)}`);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
    if (pathname === '/search') {
      router.push('/');
    }
  };

  useEffect(() => {
    const handleClearEvent = () => clearSearch();
    window.addEventListener('clear-search', handleClearEvent);
    return () => window.removeEventListener('clear-search', handleClearEvent);
  }, [pathname, router]);

  return (
    <>
    <form 
      className="search-bubble-form" 
      onSubmit={handleSearchSubmit} 
      style={{ 
        position: 'fixed', 
        top: '1.5rem', 
        right: '2rem', 
        zIndex: 1000, 
        minWidth: '0', 
        width: '100%', 
        maxWidth: '300px',
        display: 'var(--search-bar-display, block)'
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          style={{
            width: '100%',
            padding: '0.75rem 2.5rem',
            borderRadius: '30px',
            border: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            backdropFilter: 'blur(10px)'
          }}
          placeholder="Search songs, artists..."
          value={query}
          onChange={e => {
            const val = e.target.value;
            setQuery(val);
            setShowSuggestions(true);
            debouncedRunSearch(val);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none', zIndex: 10 }} />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            style={{
              position: 'absolute',
              right: '1rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul 
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            background: 'rgba(18, 18, 18, 0.4)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '0.5rem',
            zIndex: 100,
            listStyle: 'none',
            margin: 0,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSuggestionClick(s)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Search size={14} style={{ color: 'var(--text-secondary)' }} />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
    
    <Link 
      href="/search"
      className="mobile-search-icon"
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 1000,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        padding: '0.6rem',
        borderRadius: '50%',
        color: 'var(--text-primary)',
        display: 'var(--mobile-search-display, none)',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      <Search size={20} />
    </Link>
    </>
  );
}

export default function TopSearchBar() {
  return (
    <Suspense fallback={null}>
      <TopSearchBarContent />
    </Suspense>
  );
}

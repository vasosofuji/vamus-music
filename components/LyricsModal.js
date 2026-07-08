'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './LyricsModal.css';

function parseLrc(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const parsed = [];
  const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = line.match(timeReg);
    if (!match) continue;

    const min = parseInt(match[1], 10);
    const sec = parseInt(match[2], 10);
    const ms = parseInt(match[3], 10);
    const timeInSeconds = min * 60 + sec + (ms / (match[3].length === 3 ? 1000 : 100));
    
    const text = line.replace(timeReg, '').trim();
    if (text) {
      parsed.push({ time: timeInSeconds, text });
    }
  }
  return parsed;
}

export default function LyricsModal({ track, progress, onSeek, onClose }) {
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  useEffect(() => {
    if (!track) return;
    setLoading(true);
    fetch(`/api/lyrics?track=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.channel?.name || '')}`)
      .then(res => res.json())
      .then(data => {
        if (data.syncedLyrics) {
          setLyrics(parseLrc(data.syncedLyrics));
        } else {
          setLyrics([]);
        }
      })
      .catch(() => setLyrics([]))
      .finally(() => setLoading(false));
  }, [track]);

  // Find active line index based on progress
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (progress >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Scroll active line into view smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (loading) {
    return (
      <div className="lyrics-overlay" style={{ justifyContent: 'center', alignItems: 'center' }} onClick={onClose}>
        <button className="lyrics-close-btn" onClick={onClose}><X size={24} /></button>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  if (lyrics.length === 0) {
    return (
      <div className="lyrics-overlay" onClick={onClose}>
        <button className="lyrics-close-btn" onClick={onClose}><X size={24} /></button>
        <div className="lyrics-empty">No synchronized lyrics available for this song.</div>
      </div>
    );
  }

  return (
    <div className="lyrics-overlay" onClick={onClose}>
      <button className="lyrics-close-btn" onClick={onClose}><X size={24} /></button>
      <div className="lyrics-container" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        {lyrics.map((line, index) => (
          <div
            key={index}
            ref={index === activeIndex ? activeLineRef : null}
            className={`lyric-line ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onSeek(line.time)}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

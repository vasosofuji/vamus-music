'use client';

import Link from 'next/link';
import './ArtistCard.css';

export default function ArtistCard({ artist }) {
  return (
    <Link href={`/artist/${artist.id}`} className="artist-card">
      <div className="artist-card-img-wrap">
        <img 
          src={artist.thumbnail || 'invalid'} 
          alt={artist.name} 
          className="artist-card-img" 
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
        />
        <div className="artist-card-placeholder" style={{ display: 'none' }}>{artist.name?.[0] || '?'}</div>
      </div>
      <span className="artist-card-name">{artist.name}</span>
      <span className="artist-card-type">Artist</span>
    </Link>
  );
}

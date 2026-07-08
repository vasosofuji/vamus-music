'use client';

import Link from 'next/link';
import './AlbumCard.css';

export default function AlbumCard({ album }) {
  if (!album) return null;
  return (
    <Link href={`/album/${album.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="album-card">
        <div className="album-card-img-wrap">
          <img src={album.thumbnail || '/window.svg'} alt={album.name} className="album-card-img" />
        </div>
        <div className="album-card-info">
          <span className="album-card-name">{album.name}</span>
          <span className="album-card-type">{album.type || 'Album'} • {album.year || 'Unknown'}</span>
        </div>
      </div>
    </Link>
  );
}

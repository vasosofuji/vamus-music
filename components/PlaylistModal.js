'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import './PlaylistModal.css';

export default function PlaylistModal({ onClose, onCreate, initialName = '' }) {
  const [name, setName] = useState(initialName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Playlist</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            className="modal-input"
            type="text"
            placeholder="My Playlist"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="modal-btn cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn create" disabled={!name.trim()}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

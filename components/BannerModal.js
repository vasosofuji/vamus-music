'use client';

import { useState, useRef } from 'react';
import './PlaylistModal.css';

const presetGradients = [
  'linear-gradient(135deg, #1ed760 0%, #000000 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #000000 100%)',
  'linear-gradient(135deg, #ef4444 0%, #000000 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #000000 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #000000 100%)',
];

export default function BannerModal({ initialBanner, onClose, onSave }) {
  const [bg, setBg] = useState(initialBanner && initialBanner.startsWith('linear-gradient') ? initialBanner : '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        onSave(`url(${dataUrl})`);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (bg) {
      onSave(bg);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>Change Banner</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Choose a Gradient</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {presetGradients.map((g, i) => (
              <div 
                key={i} 
                onClick={() => setBg(g)}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', background: g, 
                  cursor: 'pointer', border: bg === g ? '2px solid white' : '2px solid transparent' 
                }} 
              />
            ))}
            <div 
              onClick={() => setBg('')}
              style={{ 
                width: '40px', height: '40px', borderRadius: '50%', background: '#333', 
                cursor: 'pointer', border: bg === '' ? '2px solid white' : '2px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
              }} 
            >None</div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Or Upload Image</p>
          <div 
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--text-muted)'}`,
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            Drag and drop an image here, or click to browse
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn create" onClick={handleSave}>Save Selection</button>
        </div>
      </div>
    </div>
  );
}

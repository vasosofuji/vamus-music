'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <div className="back-btn-container" style={{ position: 'sticky', top: 0, zIndex: 100, height: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <button 
        onClick={() => router.back()} 
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'background 0.2s, transform 0.2s',
          pointerEvents: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Go back"
      >
        <ChevronLeft size={26} style={{ marginLeft: '-2px' }} />
      </button>
    </div>
  );
}

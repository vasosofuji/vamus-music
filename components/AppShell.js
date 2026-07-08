'use client';

import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import TopSearchBar from '@/components/TopSearchBar';

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="app-body">
        <Sidebar />
        <main className="main-content" style={{ position: 'relative' }}>
          <TopSearchBar />
          {children}
        </main>
      </div>
      <Player />
    </div>
  );
}

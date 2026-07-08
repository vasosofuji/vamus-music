import "./globals.css";
import { MusicProvider } from '@/app/context/MusicContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import BackButton from '@/components/BackButton';
import TopSearchBar from '@/components/TopSearchBar';
import BottomNav from '@/components/BottomNav';

export const metadata = {
  title: "Vamus",
  description: "Ad-free music streaming",
};

export const viewport = {
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <MusicProvider>
            <div className="app-container">
              <Sidebar />
              <main className="main-content" style={{ position: 'relative' }}>
                <BackButton />
                <TopSearchBar />
                {children}
              </main>
              <Player />
              <BottomNav />
            </div>
          </MusicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

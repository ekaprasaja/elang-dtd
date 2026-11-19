import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Elang DTD - Monitoring Survei Door to Door',
  description: 'Aplikasi monitoring survei door-to-door, rekapitulasi data pemilih, elektabilitas kandidat, dan audit NIK patuh UU PDP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950 font-sans">
        <AppProvider>
          <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(255,255,255,0))]">
            <Header />
            <Navigation />
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
              {children}
            </main>
            <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-500 text-xs py-4 text-center">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>© 2026 Elang DTD • Sistem Monitoring Elektoral Door-to-Door</span>
                <span className="text-[11px] text-slate-600 font-mono">Keamanan NIK Terenkripsi AES-256-GCM • Patuh UU No. 27/2022 (UU PDP)</span>
              </div>
            </footer>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

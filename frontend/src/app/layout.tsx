import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/Navbar';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Enterprise Knowledge Retrieval Platform',
  description: 'Intelligent document search and synthesis powered by RAG',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}

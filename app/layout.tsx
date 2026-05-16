import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BluebottleCap',
  description: 'Instant AI polish for student writing with a premium one-screen workflow.',
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/favicon.svg' },
  ],
  openGraph: {
    title: 'BluebottleCap',
    description: 'Instant AI polish for student writing with a premium one-screen workflow.',
    siteName: 'BluebottleCap',
    type: 'website',
    images: ['http://localhost:3000/favicon.svg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#eff6ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

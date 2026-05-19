import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'BluebottleCap | Premium AI Tools for Students & Creators',
  description: 'Instant AI polish for student writing and premium image processing with a unified, one-screen workflow.',
  keywords: ['AI writer', 'image compressor', 'student tools', 'paraphrasing tool', 'bluebottlecap'],
  authors: [{ name: 'BluebottleCap' }],
  creator: 'BluebottleCap',
  metadataBase: new URL('https://bluebottlecap.com'),
  icons: [
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/favicon.svg' },
  ],
  openGraph: {
    title: 'BluebottleCap | Premium AI Tools',
    description: 'Instant AI polish for student writing and premium image processing.',
    url: 'https://bluebottlecap.com',
    siteName: 'BluebottleCap',
    images: [
      {
        url: 'https://bluebottlecap.com/favicon.svg', // Will update to real OG image when provided
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BluebottleCap | Premium AI Tools',
    description: 'Instant AI polish for student writing and premium image processing.',
    images: ['https://bluebottlecap.com/favicon.svg'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#eff6ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-900 transition-colors">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

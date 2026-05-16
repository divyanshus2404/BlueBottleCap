import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BluebottleCap',
  description: 'Instant AI text rewrites, explanations, formalization, and expansion.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

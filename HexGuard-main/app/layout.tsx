import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HexGuard — AI Media Forensics & Deepfake Detection',
  description:
    'Private AI media verification platform powered by a local Ollama vision model and Error Level Analysis (ELA) to detect AI-generated images, synthetic portraits, and digital manipulations — no cloud, no API key.',
  keywords: [
    'AI Detector',
    'Deepfake Detection',
    'Media Verification',
    'Local AI Vision',
    'Error Level Analysis',
    'EXIF Forensics',
    'Image Authentication',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

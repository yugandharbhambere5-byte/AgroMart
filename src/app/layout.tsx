import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RegisterSW } from '@/components/RegisterSW';
import { LanguageProvider } from '@/context/LanguageContext';
import { LanguageSelectionModal } from '@/components/LanguageSelectionModal';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AgroMart | Smart Farmer Marketplace Platform',
  description: 'Connect directly with local farmers, trade fresh quality crops, and explore market trends with AgroMart, the premium decentralized agriculture marketplace.',
  keywords: 'agriculture, marketplace, farmer direct, fresh crops, organic food, agritech, smart farming, B2B agriculture, buy crops online',
  authors: [{ name: 'AgroMart Team' }],
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'AgroMart | Smart Farmer Marketplace Platform',
    description: 'Empowering local farmers and bulk buyers with transparency, real-time logistics, and competitive market pricing.',
    url: 'https://agromart-platform.vercel.app',
    siteName: 'AgroMart',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgroMart | Smart Farmer Marketplace Platform',
    description: 'Empowering local farmers and bulk buyers with transparency, real-time logistics, and competitive market pricing.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgroMart',
  },
  applicationName: 'AgroMart',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#0c110e' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <LanguageProvider>
          <ThemeProvider>
            <RegisterSW />
            <LanguageSelectionModal />
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

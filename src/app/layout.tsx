import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RegisterSW } from '@/components/RegisterSW';
import { LanguageProvider } from '@/context/LanguageContext';
import { LanguageSelectionModal } from '@/components/LanguageSelectionModal';
import { LiveBackground } from '@/components/layout/LiveBackground';

import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
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
       className={`${plusJakartaSans.variable} ${outfit.variable} h-full antialiased`}
       suppressHydrationWarning
     >
       <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
         <LanguageProvider>
           <ThemeProvider>
             <RegisterSW />
             <LanguageSelectionModal />
             <LiveBackground />
             <div className="relative flex min-h-screen flex-col z-10">
               {children}
             </div>
           </ThemeProvider>
         </LanguageProvider>
       </body>
     </html>
   );
 }

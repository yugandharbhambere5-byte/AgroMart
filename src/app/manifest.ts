import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AgroMart Smart Farmer Marketplace',
    short_name: 'AgroMart',
    description: 'A modern, responsive agriculture marketplace connecting farmers directly to buyers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c110e',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}

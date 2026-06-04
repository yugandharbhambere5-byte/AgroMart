'use client';

import { useEffect } from 'react';

export function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Unregister and clear caches on localhost to prevent stale layout caching in dev mode
      if (window.location.hostname === 'localhost') {
        const cleanDevCache = async () => {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
              await registration.unregister();
            }
            if ('caches' in window) {
              const keys = await caches.keys();
              for (let key of keys) {
                await caches.delete(key);
              }
            }
            console.log('Dev cache and Service Worker cleared successfully.');
          } catch (e) {
            console.error('Failed to clear dev cache:', e);
          }
        };
        cleanDevCache();
        return;
      }

      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('AgroMart PWA ServiceWorker registered with scope:', registration.scope);
        } catch (error) {
          console.error('AgroMart PWA ServiceWorker registration failed:', error);
        }
      };

      // Register after page load for performance
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}

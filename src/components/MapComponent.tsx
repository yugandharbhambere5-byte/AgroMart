'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { MapPin, ZoomIn, ZoomOut, Navigation, HelpCircle } from 'lucide-react';

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  popupText?: string;
  type: 'user' | 'crop' | 'buyer' | 'mandi';
}

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lon: number) => void;
  selectedMarkerId?: string | null;
  showRouteTo?: { lat: number; lon: number } | null;
  interactive?: boolean;
}

export default function MapComponent({
  center,
  zoom = 12,
  markers = [],
  onMapClick,
  selectedMarkerId = null,
  showRouteTo = null,
  interactive = false,
}: MapComponentProps) {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const clickMarkerRef = useRef<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Leaflet is already loaded
    if ((window as any).L) {
      leafletRef.current = (window as any).L;
      setLeafletReady(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.id = 'leaflet-css-cdn';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.id = 'leaflet-js-cdn';
    script.async = true;
    script.onload = () => {
      leafletRef.current = (window as any).L;
      setLeafletReady(true);
    };
    document.body.appendChild(script);

    return () => {
      // Keep CDN script & style loaded so they don't reload when toggling map views, 
      // but clean up map instance if necessary
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = leafletRef.current;

    // Destroy existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false, // Custom controls instead
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Set Tile Layer based on theme
    const isDark = theme === 'dark';
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Create marker group
    markerGroupRef.current = L.featureGroup().addTo(map);

    // Setup interactive map click
    if (interactive && onMapClick) {
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing temp marker
        if (clickMarkerRef.current) {
          clickMarkerRef.current.remove();
        }

        // Add custom temporary selection marker
        const customPinIcon = L.divIcon({
          html: `<div class="relative w-8 h-8 flex items-center justify-center">
                   <div class="absolute inset-0 rounded-full bg-primary-500/30 animate-ping"></div>
                   <div class="w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow-md"></div>
                 </div>`,
          className: 'custom-pin-div',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        clickMarkerRef.current = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
        
        onMapClick(lat, lng);
      });
    }

    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setMapLoaded(false);
    };
  }, [leafletReady, theme]);

  // Handle center changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
  }, [center, mapLoaded]);

  // Handle marker updates
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !markerGroupRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = markerGroupRef.current;

    // Clear old markers
    group.clearLayers();

    if (markers.length === 0) return;

    markers.forEach((marker) => {
      // Style custom markers
      let colorClass = 'bg-primary-500';
      let pinSymbol = '📍';

      if (marker.type === 'user') {
        colorClass = 'bg-blue-600';
        pinSymbol = '👤';
      } else if (marker.type === 'crop') {
        colorClass = 'bg-emerald-500';
        pinSymbol = '🌱';
      } else if (marker.type === 'buyer') {
        colorClass = 'bg-orange-500';
        pinSymbol = '💼';
      } else if (marker.type === 'mandi') {
        colorClass = 'bg-harvest-600 bg-amber-600';
        pinSymbol = '🏢';
      }

      // Generate animated ping if it is the current user/focus
      const isActive = marker.id === selectedMarkerId || marker.type === 'user';
      const pingHtml = isActive 
        ? `<div class="absolute inset-0 rounded-full ${colorClass}/30 animate-ping"></div>`
        : '';

      const icon = L.divIcon({
        html: `<div class="relative w-8 h-8 flex items-center justify-center">
                 ${pingHtml}
                 <div class="w-6.5 h-6.5 rounded-full ${colorClass} text-[11px] flex items-center justify-center text-white border-1.5 border-card shadow-lg hover:scale-110 transition-transform">
                   ${pinSymbol}
                 </div>
               </div>`,
        className: 'custom-map-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const leafletMarker = L.marker([marker.lat, marker.lon], { icon })
        .bindPopup(`
          <div class="p-2.5 font-sans min-w-[150px] text-left text-xs bg-card border-none text-foreground flex flex-col gap-1">
            <h4 class="font-extrabold text-sm border-b border-border pb-1 mb-1 text-foreground">${marker.label}</h4>
            <p class="font-semibold text-earth-500 dark:text-earth-400 m-0 leading-relaxed">${marker.popupText || ''}</p>
            <div class="mt-2 flex items-center gap-1">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${marker.lat},${marker.lon}&travelmode=driving" 
                 target="_blank" 
                 class="no-underline inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase bg-primary-600 hover:bg-primary-700 text-white rounded cursor-pointer select-none transition-colors border-none">
                 🚗 Route Directions
              </a>
            </div>
          </div>
        `, {
          className: 'custom-leaflet-popup',
        })
        .addTo(group);

      if (marker.id === selectedMarkerId) {
        leafletMarker.openPopup();
        map.panTo([marker.lat, marker.lon]);
      }
    });

    // Zoom out slightly to fit all markers if multiple
    if (markers.length > 1) {
      try {
        const bounds = group.getBounds();
        map.fitBounds(bounds, { padding: [40, 40] });
      } catch (e) {}
    }
  }, [markers, mapLoaded, selectedMarkerId]);

  // Handle route plotting (Draw polyline)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const L = leafletRef.current;
    const map = mapInstanceRef.current;

    // Clear old route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (showRouteTo) {
      const startPoint: [number, number] = center;
      const endPoint: [number, number] = [showRouteTo.lat, showRouteTo.lon];

      const polyline = L.polyline([startPoint, endPoint], {
        color: '#10b981',
        weight: 4.5,
        dashArray: '8, 12',
        opacity: 0.85,
      }).addTo(map);

      routeLineRef.current = polyline;

      // Fit bounds to show route path
      const routeBounds = L.latLngBounds([startPoint, endPoint]);
      map.fitBounds(routeBounds, { padding: [50, 50] });
    }
  }, [showRouteTo, center, mapLoaded]);

  // Custom Zoom Handlers
  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom);
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-border bg-earth-50/50 dark:bg-earth-950/10 min-h-[300px] flex items-center justify-center">
      {!leafletReady && (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 border-r-2"></div>
          <span className="text-xs font-bold text-earth-500">Loading Map API...</span>
        </div>
      )}
      
      {leafletReady && (
        <>
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          
          {/* Custom Map Controls HUD */}
          <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 rounded-xl bg-card border border-border text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 rounded-xl bg-card border border-border text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={handleRecenter}
              className="w-10 h-10 rounded-xl bg-card border border-primary-500/20 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 flex items-center justify-center shadow-lg transition-all cursor-pointer"
              title="Center Location"
            >
              <Navigation className="w-4.5 h-4.5 rotate-45" />
            </button>
          </div>

          {/* Help Overlay HUD */}
          {interactive && (
            <div className="absolute left-4 top-4 z-20 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-xs border border-border shadow-md flex items-center gap-1.5 text-[10px] font-black text-earth-650 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              <span>Tap map to drop custom pin coordinates</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

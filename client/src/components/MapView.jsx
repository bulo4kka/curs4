import { useEffect, useRef, useState } from 'react';
import CITIES from '../cities';

const ACCENT_COLOR = '#FF0000';
const ACCENT_HOVER = '#FF3333';

// Yandex Maps API loader
let ymapsPromise = null;
let ymapsLoaded = false;

function loadYmaps(apiKey = '') {
  if (ymapsPromise) return ymapsPromise;
  
  ymapsPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }
    
    if (window.ymaps) {
      ymapsLoaded = true;
      resolve(window.ymaps);
      return;
    }
    
    const script = document.createElement('script');
    const url = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU&load=package.full&onload=onYmapsLoad`;
    
    window.onYmapsLoad = () => {
      ymapsLoaded = true;
      resolve(window.ymaps);
      delete window.onYmapsLoad;
    };
    
    script.src = url;
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Yandex Maps API'));
    document.head.appendChild(script);
  });
  
  return ymapsPromise;
}

export default function MapView({ origin, destination, stops = [], height = 300, apiKey = '' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const allLocations = [origin, ...stops, destination].filter(c => CITIES[c]);
  const coordinates = allLocations.map(c => CITIES[c]).filter(Boolean);
  const center = coordinates[0] || [53.9, 27.56];

  useEffect(() => {
    let mounted = true;
    
    const initMap = async () => {
      try {
        setIsLoading(true);
        const ymaps = await loadYmaps(apiKey);
        
        if (!mounted) return;
        
        // Wait for DOM to be ready
        await ymaps.ready();
        
        if (!mounted || !containerRef.current) return;
        
        // Create map
        const map = new ymaps.Map(containerRef.current, {
          center,
          zoom: coordinates.length > 1 ? 6 : 8,
          controls: ['zoomControl', 'fullscreenControl'],
          behaviors: ['drag', 'dblClickZoom', 'rightMouseButtonMagnifier', 'multiTouch'],
          type: 'yandex#map',
        }, {
          suppressMapOpenBlock: true,
          yandexMapDisablePoiInteractivity: true,
        });
        
        mapRef.current = map;
        
        // Custom zoom control styling
        map.controls.get('zoomControl').options.set({
          size: 'small',
          layout: ymaps.templateLayoutFactory.createClass(`
            <div class="ymaps-zoom-custom">
              <button class="ymaps-zoom-btn ymaps-zoom-in" title="Увеличить">+</button>
              <button class="ymaps-zoom-btn ymaps-zoom-out" title="Уменьшить">−</button>
            </div>
          `),
        });
        
        // Add markers
        const clusterer = new ymaps.Clusterer({
          preset: 'islands#redClusterIcons',
          groupByCoordinates: false,
          clusterDisableClickZoom: true,
          clusterHideIconOnBalloonOpen: false,
          geoObjectHideIconOnBalloonOpen: false,
        });
        
        const geoObjects = allLocations.map((city, index) => {
          const coords = CITIES[city];
          if (!coords) return null;
          
          const isOrigin = index === 0;
          const isDestination = index === allLocations.length - 1;
          
          const iconLayout = ymaps.templateLayoutFactory.createClass(`
            <div class="nothing-marker ${isOrigin ? 'origin' : isDestination ? 'destination' : 'stop'}">
              <div class="marker-inner">
                ${isOrigin ? `
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="${ACCENT_COLOR}" stroke-width="3"/>
                    <circle cx="16" cy="16" r="5" fill="${ACCENT_COLOR}"/>
                    <circle cx="16" cy="16" r="10" fill="none" stroke="${ACCENT_COLOR}" stroke-width="1" stroke-dasharray="2,4" opacity="0.5"/>
                  </svg>
                ` : isDestination ? `
                  <svg width="32" height="40" viewBox="0 0 32 40">
                    <path d="M16 40 L26 24 L6 24 Z" fill="${ACCENT_COLOR}"/>
                    <circle cx="16" cy="14" r="11" fill="none" stroke="${ACCENT_COLOR}" stroke-width="3"/>
                    <circle cx="16" cy="14" r="4" fill="${ACCENT_COLOR}"/>
                  </svg>
                ` : `
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="${ACCENT_COLOR}" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="${ACCENT_COLOR}"/>
                  </svg>
                `}
              </div>
            </div>
          `);
          
          const placemark = new ymaps.Placemark(coords, {
            balloonContentHeader: `
              <div class="balloon-header">
                ${isOrigin ? '<span class="badge origin">Отправление</span>' : ''}
                ${isDestination ? '<span class="badge destination">Прибытие</span>' : ''}
                ${!isOrigin && !isDestination ? '<span class="badge stop">Остановка</span>' : ''}
              </div>
            `,
            balloonContentBody: `
              <div class="balloon-body">
                <span class="city-name">${city}</span>
              </div>
            `,
          }, {
            iconLayout,
            iconShape: {
              type: 'Circle',
              coordinates: [0, 0],
              radius: isDestination ? 20 : 16,
            },
            iconOffset: isDestination ? [-16, -40] : [-16, -16],
            balloonOffset: isDestination ? [0, -44] : [0, -20],
            balloonCloseButton: false,
            balloonPanelMaxMapArea: 0,
          });
          
          return placemark;
        }).filter(Boolean);
        
        clusterer.add(geoObjects);
        map.geoObjects.add(clusterer);
        
        // Add route polyline
        if (coordinates.length > 1) {
          const polyline = new ymaps.Polyline(coordinates, {}, {
            strokeColor: ACCENT_COLOR,
            strokeWidth: 3,
            strokeOpacity: 0.8,
            strokeStyle: 'dash', // or use dashArray equivalent
            dashLength: 8,
            gapLength: 6,
            lineCap: 'round',
            lineJoin: 'round',
          });
          map.geoObjects.add(polyline);
          
          // Fit map to show all points
          map.setBounds(map.geoObjects.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 40,
          });
        }
        
        setIsLoading(false);
        setMapError(null);
        
      } catch (error) {
        if (mounted) {
          setMapError(error.message);
          setIsLoading(false);
        }
      }
    };
    
    initMap();
    
    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [origin, destination, stops.join(','), apiKey, center.join(',')]);

  // Re-center when coordinates change
  useEffect(() => {
    if (mapRef.current && coordinates.length > 0) {
      mapRef.current.setCenter(center, mapRef.current.getZoom(), { checkZoomRange: true });
    }
  }, [center.join(',')]);

  if (mapError) {
    return (
      <div 
        ref={containerRef}
        style={{ height, width: '100%', borderRadius: 12 }}
        className="surface flex items-center justify-center"
      >
        <div className="text-center p-8">
          <div className="text-[var(--accent)] mb-2 text-xl">⚠</div>
          <p className="text-[var(--text-muted)] text-sm">Ошибка загрузки карты</p>
          <p className="text-[var(--text-dim)] text-xs mt-1">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: 12 }}
      className="nothing-yandex-map relative"
    >
      {isLoading && (
        <div className="absolute inset-0 surface flex items-center justify-center z-10 rounded-xl">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-[var(--text-muted)] text-sm">Загрузка Яндекс.Карт…</p>
          </div>
        </div>
      )}
    </div>
  );
}
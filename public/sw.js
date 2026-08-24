/**
 * Cultiva PWA — Service Worker
 * Version: 2.1.0
 * Cache Strategy: Tiered caching (Precache App Shell + Stale-While-Revalidate + Cache-First Images + Offline fallback)
 */

const CACHE_VERSION = 'cultiva-v2.1.0';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

// Essential App Shell URLs to Precache on Install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/favicon.svg'
];

// 1. Install Event: Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[ServiceWorker] Precache partial error (non-fatal):', err);
      });
    }).then(() => {
      // Allow new service worker to activate when instructed or immediately
      return self.skipWaiting();
    })
  );
});

// 2. Activate Event: Clean up stale legacy caches & Claim Clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('cultiva-') && !name.startsWith(CACHE_VERSION))
          .map((name) => {
            console.log('[ServiceWorker] Removing legacy cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Message Listener for Skip Waiting (Auto-update capability)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Fetch Event: Multi-tiered caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (POST API calls handled separately)
  if (request.method !== 'GET') {
    // Graceful offline handler for Gemini API calls
    if (url.pathname.startsWith('/api/gemini/')) {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({
              success: false,
              offline: true,
              reply: '⚠️ Te encuentras en modo sin conexión. Las consultas con Cultiva IA requieren internet activo, pero todos tus registros locales, tablas Top Crop y la enciclopedia continúan plenamente funcionales.',
              analysis: {
                summary: 'Modo sin conexión activo.',
                observations: 'El análisis de IA requiere conexión a internet.',
                visualFeatures: ['Sin conexión activa'],
                pointsToWatch: 'Reconéctate para procesar fotografías con Gemini Vision.'
              }
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
      );
    }
    return;
  }

  // Handle Navigation (HTML Pages) -> Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shellIndex = await caches.match('/index.html');
          if (shellIndex) return shellIndex;
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Handle Images (Unsplash photos, local icons) -> Cache First with Network Fallback
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i) ||
    url.hostname.includes('images.unsplash.com')
  ) {
    event.respondWith(
      caches.open(IMAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Fallback to local icon svg if image fails
          return caches.match('/icons/icon.svg');
        }
      })
    );
    return;
  }

  // Handle Static Assets (JS, CSS, Fonts) -> Stale-While-Revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(js|css|woff2|woff|ttf)$/i)
  ) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(async (cache) => {
        const cached = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
// Simple Service Worker for Farm Management PWA
const CACHE_NAME = 'farm-pwa-v1';

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Network-first strategy
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache the response for future use
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseClone);
                    });
                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request)
                    .then(response => {
                        return response || new Response('Offline', {
                            status: 503,
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

const CACHE_NAME = 'farm-management-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/utils.js',
  '/js/db.js',
  '/js/auth.js',
  '/js/sync.js',
  '/js/ui.js',
  '/js/charts.js',
  '/js/forms.js',
  '/js/pdf.js',
  '/js/app.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // If fetch fails, try to return offline page for HTML requests
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Get data from IndexedDB that needs to be synced
    const db = await openDatabase();
    const unsyncedData = await getAllFromStore(db, 'syncQueue');
    
    for (const data of unsyncedData) {
      // Attempt to sync with Firebase
      const success = await syncWithFirebase(data);
      if (success) {
        // Remove from sync queue
        await deleteFromStore(db, 'syncQueue', data.id);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FarmDB', 3);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function syncWithFirebase(data) {
  // This would be implemented with Firebase in the main app
  // For service worker, we just return true for demo
  return true;
}

// Push notifications for health reminders
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Health reminder for your livestock',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Farm Health Reminder', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    clients.openWindow('/?page=health');
  }
});

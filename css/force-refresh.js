// Nuclear option for cache clearing
(function() {
    'use strict';
    
    console.log('Running cache cleanup...');
    
    // 1. Unregister all service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                console.log('Unregistering:', registration.scope);
                registration.unregister();
            });
        });
    }
    
    // 2. Clear all caches
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                console.log('Deleting cache:', cacheName);
                caches.delete(cacheName);
            });
        });
    }
    
    // 3. Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // 4. Clear IndexedDB
    if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
            databases.forEach(db => {
                console.log('Deleting IndexedDB:', db.name);
                indexedDB.deleteDatabase(db.name);
            });
        });
    }
    
    // 5. Redirect to clean page
    setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
    }, 1000);
})();

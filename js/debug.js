// Debug script to check if everything is loading
console.log('=== Farm Management PWA Debug ===');
console.log('Window loaded at:', new Date().toISOString());
console.log('CSS loaded:', document.styleSheets.length > 0 ? 'Yes' : 'No');
console.log('JavaScript files loaded:', document.scripts.length);
console.log('Chart.js available:', typeof Chart !== 'undefined' ? 'Yes' : 'No');
console.log('jsPDF available:', typeof window.jspdf !== 'undefined' ? 'Yes' : 'No');
console.log('Firebase available:', typeof firebase !== 'undefined' ? 'Yes' : 'No');
console.log('IndexedDB available:', 'indexedDB' in window ? 'Yes' : 'No');
console.log('Service Worker available:', 'serviceWorker' in navigator ? 'Yes' : 'No');

// Check if our app is initialized
setTimeout(() => {
    console.log('window.app exists:', window.app ? 'Yes' : 'No');
    if (window.app) {
        console.log('App currentLivestock:', window.app.currentLivestock);
        console.log('App currentPage:', window.app.currentPage);
    }
}, 1000);

// Add click listeners to debug buttons
document.addEventListener('click', function(e) {
    console.log('Clicked:', e.target.tagName, e.target.id || e.target.className);
}, true);

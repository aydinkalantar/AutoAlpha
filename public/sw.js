self.addEventListener('install', (event) => {
  console.log('AutoAlpha Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('AutoAlpha Service Worker activated');
});

// A standard fetch event listener is required by Chrome to trigger the PWA install prompt natively
self.addEventListener('fetch', (event) => {
  // Pass-through standard cacheless fetch hook 
});

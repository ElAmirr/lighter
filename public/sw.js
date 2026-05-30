self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // A basic pass-through fetch handler that fulfills the PWA criteria 
    // without heavily interfering with Next.js specific caching.
});

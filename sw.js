self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('app-store').then((cache) => cache.addAll([
      '/images/WhatsApp.png',
      '/images/logohead.png',
      '/images/icons-192.png',
      '/images/icons-512.png',
      '/icon/app-icon_192x192.png',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});


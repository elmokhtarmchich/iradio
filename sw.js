self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('radio-store').then((cache) => cache.addAll([
      '/index.html',
      '/index.js',
      '/style.css',
      '/sw.js',
      '/script.js',
	    '/audioPlayer.js',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});


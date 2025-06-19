const CACHE_NAME = 'iradio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/topnav.css',
  '/contact.css',
  '/playerstyle.css',
  '/audioPlayer.js',
  '/webbtn.js',
  './image/med.png'                                ,
'./image/coran.png'                              ,
'./image/medina.png'                             ,
'./image/chada.png'                              ,
'./image/medi.png'                               ,
'./image/mars.png'                               ,
'./image/aswat.png'                              ,
'./image/hit.png'                                ,
'./image/hit-mgharba.png'                        ,
'./image/french.png'                             ,
'./image/hit-buzz.png'                           ,
'./image/hit-radio-gold.png'                     ,
'./image/cover.png'                              ,
'./image/hit-radio-dancefloor.png'               ,
'./image/hitradiolatino.png'                     ,
'./image/u80.png'                                ,
'./image/udance.png'                             ,
'./image/urban.png'                              ,
'./image/uradio.png'                             ,
'./image/upop.png'                               ,
'./image/u90.png'                                ,
'./image/star-maroc.png'                         ,
'./image/ohayo.png'                              ,
'./image/monte-calro-doualiya.png'               ,
'./image/2m.png'                                 ,
'./image/atlantic.png'                           ,
'./image/soleil.png'                             ,
'./image/only-rai.png'                           ,
'./image/nrj-maroc.png'                          ,
'./image/sawa.png'                               ,
'./image/mfm.png'                                ,
'./image/chaine.png'                             ,
'./image/watania.png'                            ,
'./image/assadissa.png'                          ,
'./image/amazighia.png'                          ,
'./image/meknes.png'                             ,
'./image/fes.png'                                ,
'./image/tetouan.png'                            ,
'./image/tanger.png'                             ,
'./image/marrakech.png'                          ,
'./image/casa.png'                               ,
'./image/oujda.png'                              ,
'./image/dakhla.png'                             ,
'./image/agadir.png'                             ,
'./image/hoceima.png'                            ,
'./image/morrocan.png'                           ,
'./image/chabab-maroc.png'                       ,
'./image/ness.png'                               ,
'./image/plus-casablanca.png'                    ,
'./image/plus-marrakech.png'                     ,
'./image/plus-agadir.png'                        ,
'./image/yabiladi.png'                           ,
'./image/izlanzik.png'                           ,
'./image/cap.png'                                ,
'./image/sawt-ouarzazate.png'                    ,
'./image/orient-fm.png'                          ,
'./image/music.png'                              ,
'./image/izlan.png'                              ,
'./image/atbir.png'                              ,
'./image/next.png'                               ,
'./image/pause.png'                              ,
'./image/play.png'                               ,
'./image/logo.png'                               ,
];

// Install: cache all required files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, then network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch: true})
      .then(response => response || fetch(event.request))
  );
});


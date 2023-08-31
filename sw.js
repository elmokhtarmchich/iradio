self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('radio-store').then((cache) => cache.addAll([
      '/index.html',
      '/index.js',
      '/style.css',
      '/sw.js',
      '/script.js',
	    '/audioPlayer.js',
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
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});


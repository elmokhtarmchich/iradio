function preloadImages(array, waitForOtherResources, timeout) {
    var loaded = false, list = preloadImages.list, imgs = array.slice(0), t = timeout || 15*1000, timer;
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    if (!waitForOtherResources || document.readyState === 'complete') {
        loadNow();
    } else {
        window.addEventListener("load", function() {
            clearTimeout(timer);
            loadNow();
        });
        // in case window.addEventListener doesn't get called (sometimes some resource gets stuck)
        // then preload the images anyway after some timeout time
        timer = setTimeout(loadNow, t);
    }

    function loadNow() {
        if (!loaded) {
            loaded = true;
            for (var i = 0; i < imgs.length; i++) {
                var img = new Image();
                img.onload = img.onerror = img.onabort = function() {
                    var index = list.indexOf(this);
                    if (index !== -1) {
                        // remove image from the array once it's loaded
                        // for memory consumption reasons
                        list.splice(index, 1);
                    }
                }
                list.push(img);
                img.src = imgs[i];
            }
        }
    }
}


preloadImages(["./image/med.png"                                ], true);
preloadImages(["./image/coran.png"                              ], true);
preloadImages(["./image/medina.png"                             ], true);
preloadImages(["./image/chada.png"                              ], true);
preloadImages(["./image/medi.png"                               ], true);
preloadImages(["./image/mars.png"                               ], true);
preloadImages(["./image/aswat.png"                              ], true);
preloadImages(["./image/hit.png"                                ], true);
preloadImages(["./image/hit-mgharba.png"                        ], true);
preloadImages(["./image/french.png"                             ], true);
preloadImages(["./image/hit-buzz.png"                           ], true);
preloadImages(["./image/hit-radio-gold.png"                     ], true);
preloadImages(["./image/cover.png"                              ], true);
preloadImages(["./image/hit-radio-dancefloor.png"               ], true);
preloadImages(["./image/hitradiolatino.png"                     ], true);
preloadImages(["./image/u80.png"                                ], true);
preloadImages(["./image/udance.png"                             ], true);
preloadImages(["./image/urban.png"                              ], true);
preloadImages(["./image/uradio.png"                             ], true);
preloadImages(["./image/upop.png"                               ], true);
preloadImages(["./image/u90.png"                                ], true);
preloadImages(["./image/star-maroc.png"                         ], true);
preloadImages(["./image/ohayo.png"                              ], true);
preloadImages(["./image/monte-calro-doualiya.png"               ], true);
preloadImages(["./image/2m.png"                                 ], true);
preloadImages(["./image/atlantic.png"                           ], true);
preloadImages(["./image/soleil.png"                             ], true);
preloadImages(["./image/only-rai.png"                           ], true);
preloadImages(["./image/nrj-maroc.png"                          ], true);
preloadImages(["./image/sawa.png"                               ], true);
preloadImages(["./image/mfm.png"                                ], true);
preloadImages(["./image/chaine.png"                             ], true);
preloadImages(["./image/watania.png"                            ], true);
preloadImages(["./image/assadissa.png"                          ], true);
preloadImages(["./image/amazighia.png"                          ], true);
preloadImages(["./image/meknes.png"                             ], true);
preloadImages(["./image/fes.png"                                ], true);
preloadImages(["./image/tetouan.png"                            ], true);
preloadImages(["./image/tanger.png"                             ], true);
preloadImages(["./image/marrakech.png"                          ], true);
preloadImages(["./image/casa.png"                               ], true);
preloadImages(["./image/oujda.png"                              ], true);
preloadImages(["./image/dakhla.png"                             ], true);
preloadImages(["./image/agadir.png"                             ], true);
preloadImages(["./image/hoceima.png"                            ], true);
preloadImages(["./image/morrocan.png"                           ], true);
preloadImages(["./image/chabab-maroc.png"                       ], true);
preloadImages(["./image/ness.png"                               ], true);
preloadImages(["./image/plus-casablanca.png"                    ], true);
preloadImages(["./image/plus-marrakech.png"                     ], true);
preloadImages(["./image/plus-agadir.png"                        ], true);
preloadImages(["./image/yabiladi.png"                           ], true);
preloadImages(["./image/izlanzik.png"                           ], true);
preloadImages(["./image/cap.png"                                ], true);
preloadImages(["./image/sawt-ouarzazate.png"                    ], true);
preloadImages(["./image/orient-fm.png"                          ], true);
preloadImages(["./image/music.png"                              ], true);
preloadImages(["./image/izlan.png"                              ], true);
preloadImages(["./image/atbir.png"                              ], true);
preloadImages(["./image/next.png"                               ], true);
preloadImages(["./image/pause.png"                              ], true);
preloadImages(["./image/play.png"                               ], true);
preloadImages(["./image/logo.png"                               ], true);

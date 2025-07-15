document.addEventListener('DOMContentLoaded', function () {
    const config = {
        autoplay: true,
        shuffle: true,
        activeItem: 0,
        volume: 0.9,
        autoPlay: false,
        preload: "auto",
        randomPlay: false,
        loopingOn: true,
        mediaEndAction: "next",
        usePlaylistScroll: true,
        playlistScrollOrientation: "vertical",
        playlistScrollTheme: "light-thin",
        useKeyboardNavigationForPlayback: true,
        createDownloadIconsInPlaylist: true,
        createLinkIconsInPlaylist: true,
        facebookAppId: "",
        useNumbersInPlaylist: false,
        numberTitleSeparator: ".  ",
        artistTitleSeparator: " - ",
        sortableTracks: false,
        playlistItemContent: "title",
        useMediaSession: true,
        useStatistics: false,
        autoOpenPopup: false
    };

    const video = document.getElementById('videoPlayer');
    const playPauseBtn = document.getElementById('play-pause-button');
    const playPauseBtnImg = document.getElementById('play-pause-button-img');
    const nextBtn = document.getElementById('next-button');
    const prevBtn = document.getElementById('prev-button');
    const x = document.getElementsByClassName("oui-image-cover");
    const coverimg = document.getElementById("coverimg");

    class VideoPlaylist {
        constructor(config = {}) {
            this.shuffle = config.shuffle || false;
            this.playerId = config.playerId || "videoPlayer";
            this.playlistId = config.playlistId || "playlist";
            this.currentClass = config.currentClass || "current-video";
            this.length = document.querySelectorAll(`#${this.playlistId} li`).length;
            this.player = document.getElementById(this.playerId);
            this.autoplay = config.autoplay || this.player.autoplay;
            this.loop = config.loop || false;
            this.trackPos = 0;
            this.trackOrder = Array.from({ length: this.length }, (_, i) => i);

            document.querySelectorAll(`#${this.playlistId} li a`).forEach((element, index) => {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setTrack(index);
                    this.player.play();
                    this.updateUI();
                    togglePlayPause();
                });
            });

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
                navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
            }
        }

        async setTrack(arrayPos) {
            const liPos = this.trackOrder[arrayPos];
            const newTrack = document.querySelector(`#${this.playlistId} li:nth-child(${liPos + 1})`);
            const anchor = newTrack.querySelector('a');
            let trackHref = anchor.getAttribute('href');
            const fileHash = trackHref.split('#').pop().toLowerCase();
            const ext = trackHref.split('.').pop().split('?')[0].toLowerCase();

            if (this.hls) {
                this.hls.destroy();
                this.hls = null;
            }
            this.player.src = '';

            document.querySelectorAll(`.${this.currentClass}`).forEach(el => el.classList.remove(this.currentClass));
            newTrack.classList.add(this.currentClass);
            this.trackPos = arrayPos;
            this.updateUI();

            let streamUrl = trackHref.split('#')[0];

            // Only fetch tokenized URL for proxy/worker endpoints that return a tokenized URL or playlist content
            if (
                (streamUrl.includes('proxy.iradio.ma') || streamUrl.includes('.workers.dev'))
            ) {
                try {
                    const res = await fetch(streamUrl, { method: 'GET' });
                    if (!res.ok) {
                        alert('Proxy/worker endpoint error: ' + res.status);
                        return;
                    }
                    const contentType = res.headers.get('content-type');
                    const text = await res.text();
                    if (text.startsWith('http')) {
                        streamUrl = text.trim();
                        console.log('Tokenized URL from proxy/worker:', streamUrl);
                    } else if (
                        contentType &&
                        (
                            contentType.toLowerCase().includes('mpegurl') ||
                            contentType.toLowerCase().includes('audio') ||
                            contentType.toLowerCase().includes('video') ||
                            contentType.toLowerCase().includes('application/octet-stream') ||
                            contentType.toLowerCase().includes('application/x-mpegurl')
                        )
                    ) {
                        const blob = new Blob([text], { type: contentType });
                        streamUrl = URL.createObjectURL(blob);
                        console.log('Blob URL created for playlist:', streamUrl);
                    } else {
                        alert('This proxy/worker endpoint did not return a playable audio stream or a tokenized URL. Content-Type: ' + contentType);
                        return;
                    }
                } catch (err) {
                    console.error('Error fetching proxy/worker tokenized stream:', err);
                    return;
                }
            }

            console.log('Final streamUrl:', streamUrl);

            // Robust HLS/audio logic: treat .m3u8 and direct HLS URLs like the HLS.js demo
            let isHls = false;
            if (
                streamUrl.match(/\.m3u8(\?|$)/i) ||
                streamUrl.match(/\.m3u(\?|$)/i) ||
                (streamUrl.startsWith('blob:') && (ext === 'm3u8' || ext === 'm3u')) ||
                streamUrl.includes('playlist?id=') // Accept direct HLS playlist URLs like bodkas.com
            ) {
                isHls = true;
            }

            if (Hls.isSupported() && isHls) {
                this.hls = new Hls();
                this.hls.loadSource(streamUrl);
                this.hls.attachMedia(this.player);
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.player.play();
                });
            } else if (
                (this.player.canPlayType('application/vnd.apple.mpegurl') ||
                 this.player.canPlayType('application/x-mpegurl')) && isHls
            ) {
                this.player.src = streamUrl;
                this.player.addEventListener('loadedmetadata', () => {
                    this.player.play();
                }, { once: true });
            } else if (
                ext === 'mp3' || ext === 'aac' || ext === 'ogg' || fileHash === 'aud' ||
                this.player.canPlayType('audio/mpeg') !== ''
            ) {
                this.player.src = streamUrl;
                this.player.play();
            } else {
                this.player.src = streamUrl;
                this.player.play().catch(err => {
                    console.error('Playback failed (last resort):', err);
                });
                console.error('Unsupported or unknown media format:', streamUrl);
            }
        }

        playPause() {
            event.preventDefault();
            video.paused ? video.play() : video.pause();
            togglePlayPause();
        }

        prevTrack() {
            if (this.trackPos === 0) {
                this.setTrack(0);
            } else {
                this.setTrack(this.trackPos - 1);
            }
            this.player.play();
            playPauseBtnImg.src = './image/pause.png';
            this.updateUI();
        }

        nextTrack() {
            if (this.trackPos < this.length - 1) {
                this.setTrack(this.trackPos + 1);
            } else {
                this.setTrack(0);
            }
            this.player.play();
            playPauseBtnImg.src = './image/pause.png';
            this.updateUI();
        }

        updateUI() {
            document.title = x[this.trackPos].title;
            document.getElementById("artist").innerHTML = x[this.trackPos].title;
            coverimg.src = x[this.trackPos].src;
            togglePlayPause();
        }
    }

    const playlist = new VideoPlaylist(config);

    playPauseBtn.addEventListener('click', () => playlist.playPause());
    prevBtn.addEventListener('click', () => playlist.prevTrack());
    nextBtn.addEventListener('click', () => playlist.nextTrack());

    document.addEventListener('click', function (event) {
        if (event.target.tagName === 'A' && event.target.closest(`#${playlist.playlistId}`)) {
            event.preventDefault();
        }
    });

    function togglePlayPause() {
        if (!video.paused) {
            playPauseBtnImg.src = './image/pause.png';
        } else {
            playPauseBtnImg.src = './image/play.png';
        }
        coverimg.src = x[playlist.trackPos].src;
    }

    function monitorPlayerToggle() {
        video.addEventListener('play', togglePlayPause);
        video.addEventListener('pause', togglePlayPause);
        video.addEventListener('ended', togglePlayPause);
    }

    monitorPlayerToggle();
});

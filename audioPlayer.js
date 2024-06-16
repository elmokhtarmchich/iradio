document.addEventListener('DOMContentLoaded', function () {
    // Configuration
    const config = {
        autoplay: true,
        shuffle: true,
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

    // Elements
    const video = document.getElementById('videoPlayer');
    const playPauseBtn = document.getElementById('play-pause-button');
    const nextBtn = document.getElementById('next-button');
    const prevBtn = document.getElementById('prev-button');
    const x = document.getElementsByClassName("oui-image-cover");

    // Keyboard controls
    if (video) {
        window.addEventListener('keydown', function (event) {
            if (event.key === ' ') { // spacebar
                event.preventDefault();
                togglePlayPause();
                video.paused ? video.play() : video.pause();
            }
        });
    }

    // Class for video playlist
    class VideoPlaylist {
        constructor(config = {}) {
            this.shuffle = config.shuffle;
            this.playerId = config.playerId || "videoPlayer";
            this.playlistId = config.playlistId || "playlist";
            this.currentClass = config.currentClass || "current-video";
            this.length = document.querySelectorAll(`#${this.playlistId} li`).length;
            this.player = document.getElementById(this.playerId);
            this.autoplay = config.autoplay || this.player.autoplay;
            this.loop = config.loop;
            this.trackPos = 0;
            this.trackOrder = Array.from({ length: this.length }, (_, i) => i);

            this.init();
        }

        init() {
            document.querySelectorAll(`#${this.playlistId} li a`).forEach((link, index) => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setTrack(this.trackOrder.indexOf(index));
                    this.player.play();
                    this.updateUI();
                });
            });

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
                navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
            }

            playPauseBtn.addEventListener('click', () => this.playPause());
            prevBtn.addEventListener('click', () => this.prevTrack());
            nextBtn.addEventListener('click', () => this.nextTrack());
        }

        randomizeOrder() {
            for (let i = this.trackOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.trackOrder[i], this.trackOrder[j]] = [this.trackOrder[j], this.trackOrder[i]];
            }
        }

        setTrack(arrayPos) {
            const liPos = this.trackOrder[arrayPos];
            const trackUrl = document.querySelector(`#${this.playlistId} li:nth-child(${liPos + 1}) a`).href;

            if (this.hls) {
                this.hls.destroy();
                this.hls = null;
            }

            const knownHlsUrls = [
                'https://stream.bodkas.com/playlist?id=mfmradio',
                'https://stream.bodkas.com/playlist?id=3',
                'https://stream.bodkas.com/playlist?id=chadafmradio',
                'http://stream3.broadcast-associes.com:8405/Radio-Orient',
                'https://izlan.fr/radios/atlas/stream',
                'http://stream1.coran.tk:8005/stream/1/',
                'http://channel0.moroccanvoice.com:8000/;stream/1',
                'https://mbn-channel-04.akacast.akamaistream.net/7/26/233453/v1/ibb.akacast.akamaistream.net/mbn_channel_04',
                'https://stream2.atlanticradio.ma:9300/stream',
                'https://manager8.streamradio.fr:1775/stream',
                'https://listen.radioking.com/radio/252934/stream/297385'
            ];

            const hlsMimeTypes = [
                'application/vnd.apple.mpegurl',
                'application/x-mpegURL',
                'application/vnd.apple.mpegurl.audio',
                'application/vnd.apple.mpegurl.video'
            ];

            const fileType = trackUrl.split('.').pop().toLowerCase();
            const fileHash = trackUrl.split('#').pop().toLowerCase();
            const isKnownHlsUrl = knownHlsUrls.includes(trackUrl);

            this.player.src = '';

            if (Hls.isSupported() && (fileType === 'm3u8' || fileType === 'm3u' || isKnownHlsUrl)) {
                this.hls = new Hls();
                this.hls.loadSource(trackUrl);
                this.hls.attachMedia(this.player);
            } else if (fileType === 'mp3' || fileType === 'ogg' || fileType === 'aac' || fileHash === "aud") {
                this.player.src = trackUrl;
            } else if (hlsMimeTypes.some(type => this.player.canPlayType(type) !== '')) {
                this.player.src = trackUrl;
            } else {
                console.error('Unsupported media type');
                return;
            }

            this.player.play().catch(error => {
                console.error('Error playing the media:', error);
            });

            document.querySelector(`.${this.currentClass}`).classList.remove(this.currentClass);
            document.querySelector(`#${this.playlistId} li:nth-child(${liPos + 1})`).classList.add(this.currentClass);
            this.trackPos = arrayPos;
            this.updateUI();
        }

        playPause() {
            togglePlayPause();
            event.preventDefault();
            video.paused ? video.play() : video.pause();
        }

        prevTrack() {
            this.trackPos === 0 ? this.setTrack(0) : this.setTrack(this.trackPos - 1);
            this.player.play();
            playPauseBtn.src = './image/pause.png';
            this.updateUI();
        }

        nextTrack() {
            if (this.trackPos < this.length - 1) {
                this.setTrack(this.trackPos + 1);
            } else {
                if (this.shuffle) this.randomizeOrder();
                this.setTrack(0);
            }
            this.player.play();
            playPauseBtn.src = './image/pause.png';
            this.updateUI();
        }

        updateUI() {
            document.title = x[this.trackPos].title;
            document.getElementById("demo").innerHTML = x[this.trackPos].title;
            video.poster = x[this.trackPos].src;
        }
    }

    const playlist = new VideoPlaylist(config);

    // Prevent links from opening in a new tab
    document.addEventListener('click', function (event) {
        if (event.target.tagName === 'A' && event.target.closest(`#${playlist.playlistId}`)) {
            event.preventDefault();
        }
    });

    function togglePlayPause() {
        if (!video.paused) {
            playPauseBtn.src = './image/play.png';
            video.poster = x[playlist.trackPos].src;
        } else {
            playPauseBtn.src = './image/pause.png';
            video.poster = x[playlist.trackPos].src;
        }
    }
});

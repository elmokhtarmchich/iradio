document.addEventListener('DOMContentLoaded', function () {
    var config = {
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

    var video = document.getElementById('videoPlayer');
    var playPauseBtn = document.getElementById('play-pause-button');
    var playPauseBtnImg = document.getElementById('play-pause-button-img');
    var nextBtn = document.getElementById('next-button');
    var prevBtn = document.getElementById('prev-button');
    var x = document.getElementsByClassName("oui-image-cover");
    var coverimg = document.getElementById("coverimg")

    if (video) {
        window.addEventListener('keydown', function (event) {
            if (event.key === ' ') { // spacebar
                event.preventDefault();
                video.paused ? video.play() : video.pause();
                togglePlayPause();
            }
        });
    }

    class VideoPlaylist {
        constructor(config = {}) {
            var classObj = this;
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
                element.addEventListener('click', function (e) {
                    e.preventDefault();
                    classObj.setTrack(index);
                    classObj.player.play();
                    classObj.updateUI();
                    togglePlayPause();
                });
            });

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('previoustrack', function () {
                    classObj.prevTrack();
                });

                navigator.mediaSession.setActionHandler('nexttrack', function () {
                    classObj.nextTrack();
                });
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
                'https://listen.radioking.com/radio/252934/stream/297385',
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
            } else {
                if (hlsMimeTypes.some(type => this.player.canPlayType(type) !== '')) {
                    this.player.src = trackUrl;
                } else {
                    console.error('Unsupported media type');
                    return;
                }
            }

            this.player.play().catch(error => {
                console.error('Error playing the media:', error);
            });

            document.querySelector(`.${this.currentClass}`).classList.remove(this.currentClass);
            document.querySelector(`#${this.playlistId} li:nth-child(${liPos + 1})`).classList.add(this.currentClass);
            this.trackPos = arrayPos;
            this.updateUI();
        }

        setTrack(arrayPos) {
            const liPos = this.trackOrder[arrayPos];
            const newTrack = document.querySelector(`#${this.playlistId} li:nth-child(${liPos + 1})`);

            // Remove 'current-video' class from the previously playing item
            const currentTrack = document.querySelector(`.${this.currentClass}`);
            if (currentTrack) {
                currentTrack.classList.remove(this.currentClass);
            }

            // Add 'current-video' class to the newly playing item
            newTrack.classList.add(this.currentClass);

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
                'https://listen.radioking.com/radio/252934/stream/297385',
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
            } else {
                if (hlsMimeTypes.some(type => this.player.canPlayType(type) !== '')) {
                    this.player.src = trackUrl;
                } else {
                    console.error('Unsupported media type');
                    return;
                }
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

    var playlist = new VideoPlaylist(config);

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
        coverimg.src = x[this.trackPos].src;
    }
});



function monitorPlayerToggle() {
    var video = document.getElementById('videoPlayer');
    var playPauseBtnImg = document.getElementById('play-pause-button-img');
    var x = document.getElementsByClassName("oui-image-cover");

    function updatePlayPauseIcon() {
        if (video.paused) {
            playPauseBtnImg.src = './image/play.png';
        } else {
            playPauseBtnImg.src = './image/pause.png';
        }
        coverimg.src = x[this.trackPos].src;
    }

    video.addEventListener('play', updatePlayPauseIcon);
    video.addEventListener('pause', updatePlayPauseIcon);
    video.addEventListener('ended', updatePlayPauseIcon);
}





// playlist = [{ID:..., OfficialWebsite:...}, ...]
// stationId = current station's ID


// Example usage:
// updateWebButton(currentStationId, playlist);
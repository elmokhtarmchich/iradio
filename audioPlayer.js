document.addEventListener('DOMContentLoaded', function () {

    let allStations = [];
    let playlistManager;

    async function initializePlayer() {
        try {
            const response = await fetch('/api/stations');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allStations = await response.json();

            generateCategoryButtons(allStations);
            renderPlaylist('All'); 

        } catch (error) {
            console.error('Failed to initialize player:', error);
            const mainElement = document.getElementById('main');
            if(mainElement) {
                mainElement.innerHTML = '<p style="color: red; text-align: center;">Could not load radio stations. Please try again later.</p>';
            }
        }
    }

    function generateCategoryButtons(stations) {
        const categoryButtonsElement = document.getElementById('category-buttons');
        if (!categoryButtonsElement) return;

        const categories = ['All', ...new Set(stations.flatMap(s => s.category))];
        
        const buttonsHTML = categories.map(category => 
            `<button class="category-button ${category === 'All' ? 'active' : ''}" data-category="${category}">${category}</button>`
        ).join('');

        categoryButtonsElement.innerHTML = buttonsHTML;

        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                renderPlaylist(category);
                
                document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function renderPlaylist(category) {
        const playlistElement = document.getElementById('playlist');
        if (!playlistElement) {
            console.error('Playlist element not found!');
            return;
        }

        const filteredStations = category === 'All' 
            ? allStations 
            : allStations.filter(station => 
                Array.isArray(station.category) 
                    ? station.category.includes(category) 
                    : station.category === category
            );

        const playlistHTML = filteredStations.map(station => {
            const isFirstStation = filteredStations.indexOf(station) === 0;
            const liClass = isFirstStation ? 'current-video' : '';
            return `
                <li class="${liClass}">
                    <a data-id="${station.id}" href="${station.streamUrl}">
                        <div class="radio-container">
                            <img class="oui-image-cover" title="${station.title}" src="${station.imageUrl}">
                            <span class="radiotitle">${station.title}</span>
                        </div>
                    </a>
                </li>
            `;
        }).join('');

        playlistElement.innerHTML = playlistHTML;

        // Re-initialize the player logic for the new playlist
        initializePlaylistManager();
    }

    function initializePlaylistManager() {
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

        playlistManager = new VideoPlaylist(config);

        // Ensure global controls are wired up only once, or re-wired if necessary
        const playPauseBtn = document.getElementById('play-pause-button');
        const nextBtn = document.getElementById('next-button');
        const prevBtn = document.getElementById('prev-button');

        // Using a flag to ensure events are not attached multiple times
        if (!playPauseBtn.hasAttribute('data-listener-attached')) {
            playPauseBtn.addEventListener('click', () => playlistManager.playPause());
            prevBtn.addEventListener('click', () => playlistManager.prevTrack());
            nextBtn.addEventListener('click', () => playlistManager.nextTrack());
            playPauseBtn.setAttribute('data-listener-attached', 'true');
        }
    }

    const video = document.getElementById('videoPlayer');
    const playPauseBtnImg = document.getElementById('play-pause-button-img');
    const coverimg = document.getElementById("coverimg");

    class VideoPlaylist {
        constructor(config = {}) {
            this.shuffle = config.shuffle || false;
            this.playerId = config.playerId || "videoPlayer";
            this.playlistId = config.playlistId || "playlist";
            this.currentClass = config.currentClass || "current-video";
            this.player = document.getElementById(this.playerId);
            this.autoplay = config.autoplay || this.player.autoplay;
            this.loop = config.loop || false;
            this.trackPos = 0;
            
            this.attachEventListeners();
            this.length = document.querySelectorAll(`#${this.playlistId} li`).length;
            this.trackOrder = Array.from({ length: this.length }, (_, i) => i);

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
                navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
            }
        }

        attachEventListeners() {
            document.querySelectorAll(`#${this.playlistId} li a`).forEach((element, index) => {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setTrack(index);
                    this.player.play();
                    this.updateUI();
                    togglePlayPause();
                });
            });
        }

        async setTrack(arrayPos) {
            if (arrayPos < 0 || arrayPos >= this.length) {
                console.warn("Track position out of bounds, resetting to 0.");
                arrayPos = 0;
            }
            this.trackPos = arrayPos;

            const liPos = this.trackOrder[arrayPos];
            const newTrack = document.querySelector(`#${this.playlistId} li:nth-child(${liPos + 1})`);
            if (!newTrack) {
                console.error("Could not find track element in the playlist.");
                return;
            }

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
            this.updateUI();

            let streamUrl = trackHref.split('#')[0];

            if (streamUrl.includes('proxy.iradio.ma') || streamUrl.includes('.workers.dev')) {
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
                    } else if (contentType && (contentType.toLowerCase().includes('mpegurl') || contentType.toLowerCase().includes('audio') || contentType.toLowerCase().includes('video') || contentType.toLowerCase().includes('application/octet-stream') || contentType.toLowerCase().includes('application/x-mpegurl'))) {
                        const blob = new Blob([text], { type: contentType });
                        streamUrl = URL.createObjectURL(blob);
                    } else {
                        alert('This proxy/worker endpoint did not return a playable audio stream or a tokenized URL. Content-Type: ' + contentType);
                        return;
                    }
                } catch (err) {
                    console.error('Error fetching proxy/worker tokenized stream:', err);
                    return;
                }
            }

            let isHls = streamUrl.match(/\.m3u8(\?|$)/i) || streamUrl.match(/\.m3u(\?|$)/i) || (streamUrl.startsWith('blob:') && (ext === 'm3u8' || ext === 'm3u')) || streamUrl.includes('playlist?id=');

            if (Hls.isSupported() && isHls) {
                this.hls = new Hls();
                this.hls.loadSource(streamUrl);
                this.hls.attachMedia(this.player);
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => { this.player.play(); });
            } else if ((this.player.canPlayType('application/vnd.apple.mpegurl') || this.player.canPlayType('application/x-mpegurl')) && isHls) {
                this.player.src = streamUrl;
                this.player.addEventListener('loadedmetadata', () => { this.player.play(); }, { once: true });
            } else {
                this.player.src = streamUrl;
                this.player.play().catch(err => { console.error('Playback failed:', err); });
            }
        }

        playPause() {
            video.paused ? video.play() : video.pause();
            togglePlayPause();
        }

        prevTrack() {
            let newPos = this.trackPos - 1;
            if (newPos < 0) { newPos = this.length - 1; } // Loop to the end
            this.setTrack(newPos);
            this.player.play();
            playPauseBtnImg.src = './image/pause.png';
            this.updateUI();
        }

        nextTrack() {
            let newPos = this.trackPos + 1;
            if (newPos >= this.length) { newPos = 0; } // Loop to the beginning
            this.setTrack(newPos);
            this.player.play();
            playPauseBtnImg.src = './image/pause.png';
            this.updateUI();
        }

        updateUI() {
            const stationElements = document.querySelectorAll(`#${this.playlistId} .oui-image-cover`);
            if (stationElements.length > this.trackPos) {
                const currentStationElement = stationElements[this.trackPos];
                document.title = currentStationElement.title;
                document.getElementById("artist").innerHTML = currentStationElement.title;
                coverimg.src = currentStationElement.src;
            }
            togglePlayPause();
        }
    }

    function togglePlayPause() {
        if (!video.paused) {
            playPauseBtnImg.src = './image/pause.png';
        } else {
            playPauseBtnImg.src = './image/play.png';
        }
    }

    video.addEventListener('play', togglePlayPause);
    video.addEventListener('pause', togglePlayPause);
    video.addEventListener('ended', () => playlistManager.nextTrack());

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', searchStations);
    }

    function searchStations() {
        const searchTerm = searchInput.value.toLowerCase();
        const playlistItems = document.querySelectorAll('#playlist li');

        playlistItems.forEach(item => {
            const titleElement = item.querySelector('.radiotitle');
            if (titleElement) {
                const title = titleElement.textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    item.style.display = 'inline-block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }

    initializePlayer();
});

// Global function for inline bundle toggle
function toggleInlineBundle(mainStationId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const bundledStations = document.querySelectorAll(`[data-bundle-main="${mainStationId}"]`);
    const mainStationArrow = document.querySelector(`#bundle-arrow-${mainStationId}`);
    
    if (!mainStationArrow) return;
    
    const isExpanded = mainStationArrow.classList.contains('expanded');
    
    bundledStations.forEach(station => {
        if (isExpanded) {
            // Hide the stations
            station.style.display = 'none';
            station.classList.remove('bundle-station');
            station.classList.add('hidden');
        } else {
            // Show the stations with reduced opacity
            station.style.display = '';
            station.classList.remove('hidden');
            station.classList.add('bundle-station');
        }
    });
    
    mainStationArrow.classList.toggle('expanded');
}

// Global function to close all bundles
function closeAllBundles() {
    document.querySelectorAll('.bundle-arrow.expanded').forEach(arrow => {
        arrow.classList.remove('expanded');
    });
    
    document.querySelectorAll('.bundle-station').forEach(station => {
        station.style.display = 'none';
        station.classList.remove('bundle-station');
        station.classList.add('hidden');
    });
}

document.addEventListener('DOMContentLoaded', function () {

    let allStations = [];
    let playlistManager;
    
    // Bundle preferences
    const bundlePreferences = {
        defaultExpanded: localStorage.getItem('bundleDefaultExpanded') === 'true',
        autoClose: localStorage.getItem('bundleAutoClose') !== 'false' // default true
    };

    async function initializePlayer() {
        try {
            console.log('Fetching stations.json...');
            const response = await fetch('./stations.json?v=' + Date.now());
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allStations = await response.json();
            console.log('Stations loaded:', allStations.length);

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

    function identifyBundles(stations) {
        const bundles = {};
        
        stations.forEach(station => {
            if (station.bundle === 'main') {
                // This is a main station, create a bundle for it
                bundles[station.id] = {
                    main: station,
                    subStations: []
                };
            }
        });
        
        // Add sub-stations to their respective bundles
        stations.forEach(station => {
            if (typeof station.bundle === 'number' && bundles[station.bundle]) {
                bundles[station.bundle].subStations.push(station);
            }
        });

        return bundles;
    }

    function getMainStationForBundle(bundleStations, bundleKey) {
        // With the new system, the main station is already identified
        return bundleStations.main || null;
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

        const bundles = identifyBundles(filteredStations);
        const renderedMainStations = new Set();
        
        let playlistHTML = '';
        let isFirstOverall = true;

        // Render stations in original order
        filteredStations.forEach(station => {
            // Skip if this station is already rendered as part of a bundle
            if (renderedMainStations.has(station.id)) return;
            
            // Check if this is a main bundle station
            const isMainBundle = station.bundle === 'main';
            const bundle = isMainBundle ? bundles[station.id] : null;
            
            if (isMainBundle && bundle && bundle.subStations.length > 0) {
                // Render main bundle station with indicator
                const liClass = isFirstOverall ? 'current-video' : '';
                const isComingSoon = station.status === 'coming soon';
                const containerClass = isComingSoon ? 'radio-container coming-soon bundle-main' : 'radio-container bundle-main';
                
                const bundleName = `${station.title} Bundle`;
                const stationCount = bundle.subStations.length + 1; // +1 for main station
                const isExpandedByDefault = bundlePreferences.defaultExpanded;
                
                playlistHTML += `
                    <li class="${liClass}">
                        <a data-id="${station.id}" href="${station.streamUrl}">
                            <div class="${containerClass}">
                                <img class="oui-image-cover" title="${station.title}" src="${station.imageUrl}">
                                <span class="radiotitle">${station.title}</span>
                                <div class="bundle-indicator" onclick="toggleInlineBundle(${station.id}, event); return false;">
                                    <div class="bundle-name">${bundleName}</div>
                                    <div class="bundle-count">${stationCount} stations</div>
                                    <span class="bundle-arrow" id="bundle-arrow-${station.id}" ${isExpandedByDefault ? 'class="expanded"' : ''}>▶</span>
                                </div>
                            </div>
                        </a>
                    </li>
                `;

                // Add sub-stations (respect default expanded preference)
                bundle.subStations.forEach(subStation => {
                    const isComingSoon = subStation.status === 'coming soon';
                    const containerClass = isComingSoon ? 'radio-container coming-soon' : 'radio-container';
                    const subStationClass = isExpandedByDefault ? 'bundle-station' : 'hidden';
                    playlistHTML += `
                        <li class="${subStationClass}" data-bundle-main="${station.id}">
                            <a data-id="${subStation.id}" href="${subStation.streamUrl}">
                                <div class="${containerClass}">
                                    <img class="oui-image-cover" title="${subStation.title}" src="${subStation.imageUrl}">
                                    <span class="radiotitle">${subStation.title}</span>
                                </div>
                            </a>
                        </li>
                    `;
                });
                
                renderedMainStations.add(station.id);
            } else if (typeof station.bundle !== 'number') {
                // Render regular station (not a sub-station)
                const liClass = isFirstOverall ? 'current-video' : '';
                const isComingSoon = station.status === 'coming soon';
                const containerClass = isComingSoon ? 'radio-container coming-soon' : 'radio-container';
                playlistHTML += `
                    <li class="${liClass}">
                        <a data-id="${station.id}" href="${station.streamUrl}">
                            <div class="${containerClass}">
                                <img class="oui-image-cover" title="${station.title}" src="${station.imageUrl}">
                                <span class="radiotitle">${station.title}</span>
                            </div>
                        </a>
                    </li>
                `;
            }
            // Skip sub-stations (they're rendered with their main station)
            
            isFirstOverall = false;
        });

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
                    
                    // Check if this is a bundled station or main bundle station
                    const listItem = element.closest('li');
                    const isSubStation = listItem.hasAttribute('data-bundle-main');
                    const isMainBundle = listItem.querySelector('.bundle-main');
                    
                    // Close all bundles if selecting a regular station (not bundled) and auto-close is enabled
                    if (!isSubStation && !isMainBundle && bundlePreferences.autoClose) {
                        closeAllBundles();
                    }
                    
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
    const searchIcon = document.querySelector('.search-icon');

    if (searchInput) {
        searchInput.addEventListener('keyup', searchStations);
    }

    if (searchIcon && searchInput) {
        searchIcon.addEventListener('click', () => {
            searchInput.classList.toggle('active');
            if (searchInput.classList.contains('active')) {
                searchInput.focus();
            }
        });
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

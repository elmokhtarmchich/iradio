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
    let stationLookup = new Map();
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
            stationLookup = new Map(allStations.map(station => [station.id, station]));
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
            this.stationIds = [];
            this.stationHistory = [];
            this.currentStationId = null;
            this.currentStation = null;
            this.lastStableTrackPos = 0;
            this.selectionGeneration = 0;
            this.lastObjectUrl = null;

            this.attachEventListeners();
            this.length = document.querySelectorAll(`#${this.playlistId} li`).length;
            this.trackOrder = Array.from({ length: this.length }, (_, i) => i);

            this.refreshStationIdIndex();

            this.player.addEventListener('error', () => {
                console.warn('Audio player reported an error; keeping the active station contract stable and avoiding automatic station recovery.');
            });

            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
                navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
                navigator.mediaSession.setActionHandler('play', () => {
                    if (this.player.paused) {
                        this.player.play().catch(() => {});
                    }
                    togglePlayPause();
                });
                navigator.mediaSession.setActionHandler('pause', () => {
                    this.player.pause();
                    togglePlayPause();
                });
            }
        }

        attachEventListeners() {
            document.querySelectorAll(`#${this.playlistId} li a`).forEach((element) => {
                element.addEventListener('click', async (e) => {
                    e.preventDefault();

                    // Check if this is a bundled station or main bundle station
                            const listItem = element.closest('li');
                    const isSubStation = listItem.hasAttribute('data-bundle-main');
                    const isMainBundle = listItem.querySelector('.bundle-main');

                    // Close all bundles if selecting a regular station (not bundled) and auto-close is enabled
                    if (!isSubStation && !isMainBundle && bundlePreferences.autoClose) {
                        closeAllBundles();
                    }

                    const stationId = Number(element.dataset.id);
                    if (!stationId) {
                        console.warn('Clicked playlist row does not expose a station ID.');
                        return;
                    }

                    await this.setTrackByStationId(stationId);
                    togglePlayPause();
                });
            });
        }

        refreshStationIdIndex() {
            const anchors = Array.from(document.querySelectorAll(`#${this.playlistId} li a[data-id]`));
            this.stationIds = anchors.map(anchor => {
                const id = Number(anchor.dataset.id);
                return Number.isNaN(id) ? null : id;
            }).filter((id) => Number.isInteger(id) && id > 0);

            const visibleIds = this.stationIds.slice();
            const activeTrack = visibleIds.includes(this.currentStationId) ? this.currentStationId : visibleIds[0] || null;
            if (activeTrack && !this.currentStationId) {
                this.currentStationId = activeTrack;
            }

            if (this.stationIds.length && !this.trackOrder.length) {
                this.trackOrder = Array.from({ length: this.length }, (_, i) => i);
            }
        }

        syncActiveStationWithUi(station) {
            if (!station) return;

            this.currentStation = station;
            this.currentStationId = station.id;

            if (coverimg) {
                coverimg.src = station.imageUrl || './image/defaultplayerimg.webp';
                coverimg.alt = station.title || 'Station cover';
            }

            const artistElement = document.getElementById('artist');
            if (artistElement) {
                artistElement.innerHTML = station.title || 'Now Playing ...';
            }

            const stationTitle = station.title || 'iRadio station';
            document.title = stationTitle;

            if (video) {
                video.setAttribute('poster', station.imageUrl || './image/defaultplayerimg.webp');
            }

            if ('mediaSession' in navigator && 'MediaMetadata' in window) {
                try {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: stationTitle,
                        artist: station.category || 'iRadio',
                        album: 'iRadio Live',
                        artwork: [{
                            src: station.imageUrl || './image/defaultplayerimg.webp',
                            sizes: '512x512',
                            type: 'image/png'
                        }]
                    });
                } catch (error) {
                    console.warn('Media Session metadata could not be fully applied:', error);
                }
            }
        }

        syncMediaPlaybackState() {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = video.paused ? 'paused' : 'playing';
            }
        }

        async diagnoseProxySource(station, streamUrl, generation) {
            const endpointSummary = {
                stationId: station?.id ?? null,
                stationTitle: station?.title ?? 'Unknown station',
                requestedUrl: streamUrl,
                timestamp: new Date().toISOString(),
                expectedProxyOrWorker: Boolean(
                    streamUrl && (
                        streamUrl.includes('proxy.iradio.ma') ||
                        streamUrl.includes('.workers.dev')
                    )
                )
            };

            console.group(`[Station source diagnostics] ${station?.title ?? 'Unknown'} (${station?.id ?? 'n/a'})`);
            console.info('[Source candidate]', endpointSummary);

            try {
                const res = await fetch(streamUrl, { method: 'GET' });
                const contentType = res.headers.get('content-type') || 'unknown';
                const body = await res.text();

                endpointSummary.httpStatus = `${res.status} ${res.statusText}`;
                endpointSummary.contentType = contentType;
                endpointSummary.bodyLength = body.length;
                endpointSummary.preview = body.slice(0, 80);

                if (res.ok) {
                    console.info('[Source reached]', `${station?.title ?? 'Station'} reached ${streamUrl} => ${res.status} ${res.statusText} (${contentType})`, endpointSummary);
                } else {
                    console.warn('[Source did not reach]', `${station?.title ?? 'Station'} failed ${streamUrl} => ${res.status} ${res.statusText} (${contentType})`, endpointSummary);
                }

                if (generation !== this.selectionGeneration) {
                    console.warn('[Source diagnostics ignored] a newer station selection is already active; this response is stale.', { generation, activeGeneration: this.selectionGeneration });
                }

                console.groupEnd();
                return { res, contentType, text: body };
            } catch (error) {
                endpointSummary.error = error?.message ?? String(error);
                console.error('[Source diagnostics failed]', `${station?.title ?? 'Station'} source probe threw for ${streamUrl}`, endpointSummary);
                console.groupEnd();
                throw error;
            }
        }

        async setTrack(stationId) {
            const generation = ++this.selectionGeneration;
            const normalizedStationId = Number(stationId);

            if (!Number.isInteger(normalizedStationId) || normalizedStationId <= 0) {
                console.warn('Invalid station id requested for playback:', stationId);
                return;
            }

            const station = stationLookup.get(normalizedStationId) || allStations.find(s => s.id === normalizedStationId);
            if (!station) {
                console.warn('Station metadata can not be resolved for station id:', normalizedStationId);
                return;
            }

            const anchor = document.querySelector(`#${this.playlistId} li a[data-id="${normalizedStationId}"]`);
            if (!anchor) {
                console.warn('Station anchor is missing from DOM for station ID:', normalizedStationId);
                return;
            }

            const newTrack = anchor.closest('li');
            if (!newTrack) {
                console.warn('Track DOM item is missing for station ID:', normalizedStationId);
                return;
            }

            this.currentStation = station;
            this.currentStationId = station.id;
            this.lastStableTrackPos = this.stationIds.indexOf(station.id);
            this.stationHistory.push(station.id);
            if (this.stationHistory.length > 16) {
                this.stationHistory = this.stationHistory.slice(-16);
            }

            this.trackPos = this.stationIds.indexOf(station.id);

            let trackHref = anchor.getAttribute('href');
            const fileHash = trackHref.split('#').pop().toLowerCase();
            const ext = trackHref.split('.').pop().split('?')[0].toLowerCase();

            if (this.hls) {
                this.hls.destroy();
                this.hls = null;
            }

            if (this.lastObjectUrl) {
                try {
                    URL.revokeObjectURL(this.lastObjectUrl);
                } catch (error) {
                    console.warn('Could not revoke a previous object URL.', error);
                }
                this.lastObjectUrl = null;
            }

            this.player.pause();
            this.player.src = '';
            this.player.load();

            if (generation !== this.selectionGeneration) {
                console.warn('Ignoring stale station selection because a newer station selection has already been requested.');
                return;
            }

            document.querySelectorAll(`.${this.currentClass}`).forEach(el => el.classList.remove(this.currentClass));
            newTrack.classList.add(this.currentClass);
            this.syncActiveStationWithUi(station);
            this.updateUI();

            let streamUrl = trackHref.split('#')[0];
            let proxyPlaylistDetected = false;

            if (streamUrl.includes('proxy.iradio.ma') || streamUrl.includes('.workers.dev')) {
                const isProxyHlsPlaylistStation = streamUrl.includes('proxy.iradio.ma') && (streamUrl.includes('/live') || streamUrl.includes('/radio2m'));

                if (isProxyHlsPlaylistStation) {
                    proxyPlaylistDetected = true;
                    console.info('[Proxy HLS direct handoff] keeping the radio proxy source as the HLS source contract.', {
                        stationId: station.id,
                        stationTitle: station.title,
                        streamUrl,
                        reason: 'HLS content type known from the station contract; browser can resolve that source directly'
                    });
                } else {
                    try {
                        const { res, contentType, text } = await this.diagnoseProxySource(station, streamUrl, generation);

                        if (generation !== this.selectionGeneration) {
                            console.warn('Ignoring stale proxy stream response for station selection.', generation, this.selectionGeneration);
                            return;
                        }

                        if (!res.ok) {
                            alert('Proxy/worker endpoint error: ' + res.status);
                            return;
                        }

                        if (generation !== this.selectionGeneration) {
                            console.warn('Ignoring stale proxy response body for station selection.', generation, this.selectionGeneration);
                            return;
                        }

                        const normalizedContentType = (contentType || '').toLowerCase();
                        const bodyLooksLikePlaylist = typeof text === 'string' && text.trim().startsWith('#EXTM3U');
                        const contentTypeLooksLikePlaylist = normalizedContentType.includes('mpegurl') || normalizedContentType.includes('x-mpegurl') || normalizedContentType.includes('application/vnd.apple.mpegurl');

                        if (text.startsWith('http')) {
                            streamUrl = text.trim();
                        } else if (bodyLooksLikePlaylist || contentTypeLooksLikePlaylist) {
                            proxyPlaylistDetected = true;
                            console.info('[HLS proxy playlist] preserving direct HLS source URL instead of wrapping proxy body as a blob source.', {
                                stationId: station.id,
                                stationTitle: station.title,
                                proxyUrl: streamUrl,
                                contentType,
                                bodyLength: text.length,
                                bodyPreview: text.slice(0, 80)
                            });
                            streamUrl = streamUrl;
                        } else if (contentType && (normalizedContentType.includes('audio') || normalizedContentType.includes('video') || normalizedContentType.includes('application/octet-stream'))) {
                            console.warn('[Direct media response] binary audio branch is safe to hand off as a direct source object only.', {
                                stationId: station.id,
                                stationTitle: station.title,
                                contentType,
                                bodyLength: text.length
                            });
                            const blob = new Blob([text], { type: contentType });
                            const blobUrl = URL.createObjectURL(blob);
                            this.lastObjectUrl = blobUrl;
                            streamUrl = blobUrl;
                        } else {
                            alert('This proxy/worker endpoint did not return a playable audio stream or a tokenized URL. Content-Type: ' + contentType);
                            return;
                        }
                    } catch (err) {
                        console.error('Error fetching proxy/worker tokenized stream:', err);
                        return;
                    }
                }
            }

            if (generation !== this.selectionGeneration) {
                console.warn('Stopping stale station stream handoff before src activation.');
                return;
            }

            let isHls = streamUrl.match(/\.m3u8(\?|$)/i) || streamUrl.match(/\.m3u(\?|$)/i) || (streamUrl.startsWith('blob:') && (ext === 'm3u8' || ext === 'm3u')) || streamUrl.includes('playlist?id=') || proxyPlaylistDetected || streamUrl.includes('proxy.iradio.ma/radio2m/live');
            console.info('[HLS source branch decision]', {
                station: station.title,
                stationId: station.id,
                streamUrl,
                isHls,
                hlsSupported: Boolean(Hls && Hls.isSupported && Hls.isSupported()),
                canPlayMpegUrl: Boolean(this.player.canPlayType('application/vnd.apple.mpegurl')),
                canPlayXMime: Boolean(this.player.canPlayType('application/x-mpegurl'))
            });

            if (Hls.isSupported() && isHls) {
                console.info('[HLS branch selected] handing stream through Hls.js', { station: station.title, streamUrl });
                this.hls = new Hls();
                this.hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error('[HLS.js error]', {
                        station: station.title,
                        stationId: station.id,
                        type: data?.type,
                        details: data?.details,
                        fatal: data?.fatal,
                        url: data?.url,
                        response: data?.response,
                        err: data?.err?.message || data?.err || null
                    });
                });
                this.hls.loadSource(streamUrl);
                this.hls.attachMedia(this.player);
                this.hls.on(Hls.Events.MANIFEST_PARSED, () => { this.player.play(); });
            } else if ((this.player.canPlayType('application/vnd.apple.mpegurl') || this.player.canPlayType('application/x-mpegurl')) && isHls) {
                console.info('[Native HLS branch selected]', { station: station.title, streamUrl });
                this.player.src = streamUrl;
                this.player.addEventListener('loadedmetadata', () => { this.player.play(); }, { once: true });
            } else {
                console.warn('[Direct source branch selected] Video element receives a direct source fallback.', {
                    station: station.title,
                    streamUrl,
                    isHls,
                    hlsSupported: Boolean(Hls && Hls.isSupported && Hls.isSupported())
                });
                this.player.src = streamUrl;
                this.player.play().catch(err => { console.error('Playback failed:', err); });
            }
        }

        playPause() {
            video.paused ? video.play() : video.pause();
            this.syncMediaPlaybackState();
            togglePlayPause();
        }

        getCurrentStationId() {
            if (this.currentStationId) {
                return this.currentStationId;
            }

            const currentAnchor = document.querySelector(`#${this.playlistId} li.current-video a[data-id]`);
            if (!currentAnchor) return null;

            const stationId = Number(currentAnchor.dataset.id);
            return Number.isNaN(stationId) ? null : stationId;
        }

        recoverFromPlaybackError() {
            if (!this.stationIds.length) {
                console.warn('No station IDs can be recovered after playback error.');
                return;
            }

            const currentId = this.getCurrentStationId();
            const currentPosition = currentId ? this.stationIds.indexOf(currentId) : this.trackPos;
            const fallbackPosition = currentPosition >= 0 ? (currentPosition + 1) % this.stationIds.length : 0;
            const fallbackStationId = this.stationIds[fallbackPosition];

            if (!fallbackStationId) {
                console.warn('No fallback station ID can be selected after playback error.');
                return;
            }

            this.setTrackByStationId(fallbackStationId);
        }

        async prevTrack() {
            if (!this.stationIds.length) {
                console.warn('Cannot move to previous track: the station ID list is empty.');
                return;
            }

            const currentStationId = this.getCurrentStationId() || this.currentStationId;
            const currentPosition = currentStationId ? this.stationIds.indexOf(currentStationId) : (this.trackPos >= 0 ? this.trackPos : 0);
            const safePosition = currentPosition >= 0 ? currentPosition : 0;
            const newPosition = (safePosition - 1 + this.stationIds.length) % this.stationIds.length;
            const stationId = this.stationIds[newPosition];

            await this.setTrack(stationId);
            playPauseBtnImg.src = './image/pause.png';
            this.updateUI();
        }

        async nextTrack() {
            if (!this.stationIds.length) {
                console.warn('Cannot move to next track: the station ID list is empty.');
                return;
            }

            const currentStationId = this.getCurrentStationId() || this.currentStationId;
            const currentPosition = currentStationId ? this.stationIds.indexOf(currentStationId) : (this.trackPos >= 0 ? this.trackPos : 0);
            const safePosition = currentPosition >= 0 ? currentPosition : 0;
            const newPosition = (safePosition + 1) % this.stationIds.length;
            const stationId = this.stationIds[newPosition];

            await this.setTrack(stationId);
            playPauseBtnImg.src = './image/pause.png';
            this.updateUI();
        }

        async setTrackByStationId(stationId) {
            const normalizedStationId = Number(stationId);
            await this.setTrack(normalizedStationId);
        }

        updateUI() {
            const currentTrack = document.querySelector(`#${this.playlistId} li.current-video`);
            if (!currentTrack) {
                togglePlayPause();
                return;
            }

            const currentAnchor = currentTrack.querySelector('a[data-id]');
            const currentImage = currentTrack.querySelector('.oui-image-cover');
            if (!currentAnchor || !currentImage) {
                togglePlayPause();
                return;
            }

            const stationId = Number(currentAnchor.dataset.id);
            const station = stationLookup.get(stationId) || allStations.find(s => s.id === stationId);
            const stationTitle = currentImage.title || currentAnchor.textContent.trim();
            const stationImage = currentImage.src;

            document.title = stationTitle;
            document.getElementById("artist").innerHTML = stationTitle;
            coverimg.src = stationImage;

            if (station) {
                this.currentStation = station;
                this.currentStationId = station.id;
                this.syncActiveStationWithUi(station);
            } else {
                this.syncActiveStationWithUi({
                    title: stationTitle,
                    imageUrl: stationImage,
                    category: 'iRadio'
                });
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

    video.addEventListener('play', () => {
        togglePlayPause();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
    });

    video.addEventListener('pause', () => {
        togglePlayPause();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    });
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

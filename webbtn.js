// Global variable to hold the current station's website URL
let currentWebBtnUrl = null;
// Global variable to cache the stations database
let stationsDatabase = null;

// Fetches and caches the station database from stations.json
async function fetchDatabase() {
    if (stationsDatabase) {
        return stationsDatabase;
    }
    try {
        const response = await fetch('/api/stations');
        if (!response.ok) {
            throw new Error(`Failed to fetch database: ${response.statusText}`);
        }
        stationsDatabase = await response.json();
        return stationsDatabase;
    } catch (error) {
        console.error('Error fetching database:', error);
        return [];
    }
}

// Sets the web button URL and visibility for a specific station ID
async function setWebButtonForStation(stationId) {
    const btn = document.getElementById('web-btn');
    if (!btn) {
        return;
    }

    if (!stationId) {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
        return;
    }

    const database = await fetchDatabase();
    if (!database || !database.length) {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
        return;
    }

    const station = database.find(st => st.id == stationId);

    if (station && station.website && station.website.trim() !== '') {
        btn.style.display = 'block';
        currentWebBtnUrl = station.website;
    } else {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
    }
}

// --- Event Listeners ---

function initializeWebButtonEventListeners() {
    // Use event delegation on the playlist container
    const playlistElement = document.getElementById('playlist');
    if (playlistElement) {
        playlistElement.addEventListener('click', async (e) => {
            // Find the clicked anchor tag, even if the user clicks on a child element (img, span)
            const anchor = e.target.closest('a');
            if (anchor && anchor.dataset.id) {
                const stationId = anchor.dataset.id;
                await setWebButtonForStation(stationId);
            }
        });
    }

    // Add click event listener to the web button itself
    const webBtn = document.getElementById('web-btn');
    if (webBtn) {
        webBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentWebBtnUrl) {
                window.open(currentWebBtnUrl, '_blank', 'noopener');
            }
        });
    }
}


// --- Initialization ---

async function initializeWebButton() {
    // Pre-fetch the database on page load
    await fetchDatabase();
    // Set up the event listeners
    initializeWebButtonEventListeners();
    
    // Set initial state for the button based on the default loaded station
    // We need to wait for the playlist to be rendered by audioPlayer.js
    // A simple timeout can work, but a more robust solution would be a custom event or callback
    setTimeout(() => {
        const initialStation = document.querySelector('#playlist li a');
        if (initialStation) {
            setWebButtonForStation(initialStation.dataset.id);
        }
    }, 500); // Wait 500ms for audioPlayer.js to likely have finished rendering
}

// Run initialization when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebButton);
} else {
    initializeWebButton();
}

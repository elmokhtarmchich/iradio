// playlist = [{ID:..., OfficialWebsite:...}, ...]
// stationId = current station's ID

let currentWebBtnUrl = null;

async function fetchDatabase() {
    try {
        const response = await fetch('database.csv');
        if (!response.ok) throw new Error(`Failed to fetch database: ${response.statusText}`);
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows.shift();
        return rows.map(row => Object.fromEntries(row.map((value, index) => [headers[index], value])));
    } catch (error) {
        console.error('Error fetching database:', error);
        return [];
    }
}

async function setWebButtonForCurrentStation() {
    const btn = document.getElementById('web-btn');
    const stationId = getStationIdFromPlaylist();

    if (!btn) {
        console.error('web-btn element not found in DOM.');
        return;
    }

    if (!stationId) {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
        console.warn('No stationId found (no current-video in playlist).');
        return;
    }

    const database = await fetchDatabase();
    if (!database.length) {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
        console.error('Database is empty or failed to load.');
        return;
    }

    const station = database.find(st => st.StationId === stationId);

    if (station && station.OfficialWebsite) {
        btn.style.display = 'block';
        currentWebBtnUrl = station.OfficialWebsite;
        console.log(`Web button set for stationId=${stationId}, url=${currentWebBtnUrl}`);
    } else {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
        console.warn(`No OfficialWebsite found for stationId=${stationId}`);
    }
}

function getStationIdFromPlaylist() {
    const currentElement = document.querySelector(`#playlist li.current-video a`);
    if (!currentElement) {
        console.warn('No current-video <li> with <a> found in playlist.');
        return null;
    }
    const id = currentElement.dataset.id || null;
    if (!id) {
        console.warn('No data-id attribute found on current <a>.');
    }
    return id;
}

// Update the button URL and visibility when the station changes
document.querySelectorAll(`#playlist li a`).forEach((element) => {
    element.addEventListener('click', async () => {
        console.log('Playlist item clicked, updating web button...');
        await setWebButtonForCurrentStation();
    });
});

// Open the URL when the button is clicked
document.getElementById('web-btn').addEventListener('click', function (e) {
    if (currentWebBtnUrl) {
        console.log(`Opening website: ${currentWebBtnUrl}`);
        window.open(currentWebBtnUrl, '_blank', 'noopener');
        e.preventDefault();
    } else {
        console.warn('No website URL set for current station.');
        e.preventDefault();
    }
});

// Initialize on page load, and also after DOMContentLoaded to ensure button exists
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing web button...');
        setWebButtonForCurrentStation();
    });
} else {
    console.log('DOM already loaded, initializing web button...');
    setWebButtonForCurrentStation();
}

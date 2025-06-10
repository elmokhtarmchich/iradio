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

async function setWebButtonForSpecificStation(stationId) {
    const btn = document.getElementById('web-btn');

    if (!btn) {
        console.error('web-btn element not found in DOM.');
        return;
    }

    if (!stationId) {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
        console.warn('No stationId provided.');
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
    return null; // This function is no longer needed
}

// Update the button URL and visibility when the station changes
document.querySelectorAll(`#playlist li a`).forEach((element) => {
    element.addEventListener('click', async () => {
        const stationId = element.dataset.id; // Get the stationId directly from the clicked element
        console.log(`Playlist item clicked, updating web button for stationId: ${stationId}`);
        await setWebButtonForSpecificStation(stationId); // Pass the stationId to a new function
    });
});

// Open the URL when the button is clicked
const webBtn = document.getElementById('web-btn');
if (webBtn) {
    webBtn.addEventListener('click', function (e) {
        if (currentWebBtnUrl) {
            console.log(`Opening website: ${currentWebBtnUrl}`);
            window.open(currentWebBtnUrl, '_blank', 'noopener');
            e.preventDefault();
        } else {
            console.warn('No website URL set for current station.');
            e.preventDefault();
        }
    });
} else {
    console.error('web-btn element not found in DOM when adding click event listener.');
}

// Initialize on page load, and also after DOMContentLoaded to ensure button exists
async function initializeWebButton() {
    console.log('Initializing web button...');
    //setWebButtonForCurrentStation(); // Remove this line
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebButton);
    console.log('DOM loading, initializing web button on DOMContentLoaded...');
} else {
    console.log('DOM already loaded, initializing web button...');
    initializeWebButton();
}

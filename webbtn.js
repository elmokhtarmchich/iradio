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

    if (!stationId) {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
        return;
    }

    const database = await fetchDatabase();
    const station = database.find(st => st.StationId === stationId);

    if (station && station.OfficialWebsite) {
        btn.style.display = 'block';
        currentWebBtnUrl = station.OfficialWebsite;
    } else {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
    }
}

function getStationIdFromPlaylist() {
    const currentElement = document.querySelector(`#playlist li.current-video a`);
    return currentElement?.dataset.id || null;
}

// Update the button URL and visibility when the station changes
document.querySelectorAll(`#playlist li a`).forEach((element) => {
    element.addEventListener('click', async () => {
        await setWebButtonForCurrentStation();
    });
});

// Open the URL when the button is clicked
document.getElementById('web-btn').addEventListener('click', function (e) {
    if (currentWebBtnUrl) {
        // Always open the URL, and prevent default just in case
        window.open(currentWebBtnUrl, '_blank', 'noopener');
        e.preventDefault();
    } else {
        // Optionally, show a message or just prevent default
        e.preventDefault();
    }
});

// Initialize on page load, and also after DOMContentLoaded to ensure button exists
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setWebButtonForCurrentStation);
} else {
    setWebButtonForCurrentStation();
}

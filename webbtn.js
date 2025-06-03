// playlist = [{ID:..., OfficialWebsite:...}, ...]
// stationId = current station's ID

async function fetchDatabase() {
    try {
        const response = await fetch('database.csv');
        if (!response.ok) {
            throw new Error(`Failed to fetch database: ${response.statusText}`);
        }
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows.shift(); // Extract headers
        return rows.map(row => Object.fromEntries(row.map((value, index) => [headers[index], value])));
    } catch (error) {
        console.error('Error fetching database:', error);
        return [];
    }
}

async function updateWebButton() {
    const stationId = getStationIdFromPlaylist();
    const btn = document.getElementById('web-btn');

    if (!stationId) {
        btn.style.display = 'none'; // Hide button if no station is playing
        btn.onclick = null;
        console.warn('No station is currently playing.');
        return;
    }

    const database = await fetchDatabase();
    const station = database.find(st => st.StationId === stationId);

    if (station && station.OfficialWebsite) {
        btn.style.display = 'block'; // Show button
        btn.onclick = () => window.open(station.OfficialWebsite, '_blank'); // Open website
    } else {
        btn.style.display = 'none'; // Hide button if no website is found
        btn.onclick = null;
        console.warn(`No official website found for station ID: ${stationId}`);
    }
}

function getStationIdFromPlaylist() {
    const currentElement = document.querySelector(`#playlist li.current-video a`);
    if (!currentElement) {
        console.warn('No current video element found.');
        return null;
    }
    return currentElement.dataset.id || null; // Return the data-id or null
}

// Ensure the web button is updated immediately after the station changes
document.querySelectorAll(`#playlist li a`).forEach((element) => {
    element.addEventListener('click', async () => {
        await updateWebButton(); // Update the button immediately after station change
    });
});

// Update the web button when the button is clicked
document.getElementById('web-btn').addEventListener('click', updateWebButton);

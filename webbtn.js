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

// When the station changes, update the button's handler and url
document.querySelectorAll(`#playlist li a`).forEach((element) => {
    element.addEventListener('click', async () => {
        await setWebButtonForCurrentStation();
    });
});

// When the button is clicked, open the url if set
document.getElementById('web-btn').addEventListener('click', function (e) {
    if (currentWebBtnUrl) {
        window.open(currentWebBtnUrl, '_blank');
    } else {
        e.preventDefault();
    }
});

// Optionally, initialize on page load
setWebButtonForCurrentStation();

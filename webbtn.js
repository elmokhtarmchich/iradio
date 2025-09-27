// Global variable to hold the current station's website URL
let currentWebBtnUrl = null;
// Global variable to cache the stations database
let stationsDatabase = null;

// Fetches the station database from stations.json
async function fetchDatabase() {
    // Return cached database if available
    if (stationsDatabase) {
        return stationsDatabase;
    }
    try {
        const response = await fetch('stations.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch database: ${response.statusText}`);
        }
        stationsDatabase = await response.json();
        return stationsDatabase;
    } catch (error) {
        console.error('Error fetching database:', error);
        return []; // Return empty array on error
    }
}

// Sets the web button URL and visibility for a specific station ID
async function setWebButtonForStation(stationId) {
    const btn = document.getElementById('web-btn');
    if (!btn) {
        console.error('web-btn element not found in DOM.');
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
        console.error('Database is empty or failed to load.');
        return;
    }

    // Find the station by ID (use == to handle string/number comparison)
    const station = database.find(st => st.id == stationId);

    // Check if the station and its website property exist and are not empty
    if (station && station.website && station.website.trim() !== '') {
        btn.style.display = 'block';
        currentWebBtnUrl = station.website;
        console.log(`Web button set for stationId=${stationId}, url=${currentWebBtnUrl}`);
    } else {
        btn.style.display = 'none';
        currentWebBtnUrl = null;
    }
}

// --- Event Listeners ---

// Add click event listeners to all playlist items
document.querySelectorAll('#playlist li a').forEach((element) => {
    element.addEventListener('click', async () => {
        const stationId = element.dataset.id;
        await setWebButtonForStation(stationId);
    });
});

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

// --- Initialization ---

// Ensures the web button logic is initialized after the DOM is loaded
async function initializeWebButton() {
    // Pre-fetch the database on page load
    await fetchDatabase();

    // You might want to set an initial state for the button here
    // For example, for the first station in the list or a default station.
    // For now, it will remain hidden until a station is clicked.
    const initialStation = document.querySelector('#playlist li a');
    if (initialStation) {
        await setWebButtonForStation(initialStation.dataset.id);
    }
}

// Run initialization when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebButton);
} else {
    initializeWebButton();
}

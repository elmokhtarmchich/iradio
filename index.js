

// Register service worker to control making site work offline

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then(() => { console.log('Service Worker Registered'); });
}


// Code to handle install prompt on desktop
let deferredPrompt;
const installApp = document.getElementById('installApp');

installApp.addEventListener('click', async () => {
    if (deferredPrompt !== null) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt = null;
        }
    }
});

window.addEventListener('beforeinstallprompt', (e) => {
    $('.install-app-btn-container').show();
    deferredPrompt = e;
});

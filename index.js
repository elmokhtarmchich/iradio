let deferredPrompt;
const addBtn = document.querySelector('.add-button');

console.log('PWA Installation Script Loaded');
console.log('Add button found:', addBtn);

if ('serviceWorker' in navigator) {
  console.log('Service Worker supported');
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    e.preventDefault();
    deferredPrompt = e;
    addBtn.style.display = 'block';
    console.log('Add button shown');
  });

  addBtn.addEventListener('click', handleAddBtnClick);

  function handleAddBtnClick() {
    console.log('Add button clicked, deferredPrompt:', deferredPrompt);
    if (!deferredPrompt) {
      console.error('No deferredPrompt available');
      alert('PWA installation not available. Please refresh the page and try again.');
      return;
    }
    addBtn.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.warn('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
      addBtn.removeEventListener('click', handleAddBtnClick);
    });
  }
} else {
  console.error('Service Worker not supported');
}

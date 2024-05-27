let deferredPrompt;
const addBtn = document.querySelector('#add-button');

if ('serviceWorker' in navigator) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addBtn.style.display = 'block';
  });

  addBtn.addEventListener('click', handleAddBtnClick);

  function handleAddBtnClick() {
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
}

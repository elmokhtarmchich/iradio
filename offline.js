document.addEventListener('DOMContentLoaded', function() {
    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.textContent = 'You are currently offline. Please check your internet connection.';
    document.body.appendChild(notification);

    function updateOnlineStatus() {
        if (navigator.onLine) {
            notification.style.display = 'none';
        } else {
            notification.style.display = 'block';
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial check
    updateOnlineStatus();
});
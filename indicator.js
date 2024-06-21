        document.addEventListener('DOMContentLoaded', function () {
            const videoPlayer = document.getElementById('videoPlayer');
            const indicator = document.getElementById('indicator');

            // Function to update the indicator based on video player state
            function updateIndicator() {
                if (videoPlayer.paused) {
                    indicator.style.backgroundColor = 'red'; // Paused state
                    indicator.classList.remove('blink', 'orange', 'green');
                } else if (videoPlayer.readyState < 4) {
                    indicator.style.backgroundColor = 'orange'; // Loading or buffering state
                    indicator.classList.add('blink');
                    indicator.classList.remove('green');
                } else {
                    indicator.style.backgroundColor = 'green'; // Playing state
                    indicator.classList.add('blink');
                    indicator.classList.remove('orange');
                }
            }

            // Add event listeners to monitor the video player state
            videoPlayer.addEventListener('play', updateIndicator);
            videoPlayer.addEventListener('pause', updateIndicator);
            videoPlayer.addEventListener('ended', updateIndicator);
            videoPlayer.addEventListener('waiting', () => {
                indicator.style.backgroundColor = 'orange'; // Buffering or waiting state
                indicator.classList.add('blink');
                indicator.classList.remove('green');
            });
            videoPlayer.addEventListener('playing', updateIndicator);
            videoPlayer.addEventListener('canplay', updateIndicator);
            videoPlayer.addEventListener('canplaythrough', updateIndicator);
            videoPlayer.addEventListener('loadstart', () => {
                indicator.style.backgroundColor = 'orange'; // Loading state
                indicator.classList.add('blink');
                indicator.classList.remove('green');
            });
            videoPlayer.addEventListener('stalled', () => {
                indicator.style.backgroundColor = 'orange'; // Stalled state
                indicator.classList.add('blink');
                indicator.classList.remove('green');
            });
            videoPlayer.addEventListener('loadeddata', updateIndicator);

            // Initial indicator update
            updateIndicator();
        });
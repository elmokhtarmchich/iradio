/*
    Default constructor configuration:
        autoplay: false,
        shuffle: false,
        loop: false,
        playerId: "audioPlayer",
        playlistId: "playlist",
        currentClass: "current-song"
        
    Methods:
        setLoop
        setShuffle
        toggleShuffle
        toggleLoop
        prevTrack
        nextTrack
    
    Can access player by .player variable
    example playlist.player.pause();
*/
/*------------------------------------------------*/
// Press spacebar to Play/Pause.
var x = document.getElementsByClassName("oui-image-cover");



var audio = document.getElementById('audioPlayer');


if (audio) {
  window.addEventListener('keydown', function (event) {
    var key = event.which || event.keyCode;
	var btn = $(".button");

    if (key === 32) { // spacebar
      // eat the spacebar, so it does not scroll the page
	       togglePlayPause();
	   event.preventDefault();
      audio.paused ? audio.play() : audio.pause();
	      }
  });
}

/*
$(document).ready(function() {
var btn = $(".button");
btn.click(function() {
btn.toggleClass("paused");
    return false;
  });
});
*/

function togglePlayPause() {
	   mediaPlayer = document.getElementById('audioPlayer');
   var btn = document.getElementById('play-pause-button');
   if (! mediaPlayer.paused) {
      btn.title = 'play';
      btn.className = 'play';
   }
   else {
      btn.title = 'pause';
      btn.className = 'pause';
   }
}

	/*------------------------------------------------------------*/

class AudioPlaylist{

    setTrack(arrayPos){

        var liPos = this.trackOrder[arrayPos]; // convert array index to html index
        this.player.src = $("#"+this.playlistId+ " li a").eq(liPos).attr("href");
        $("."+this.currentClass).removeClass(this.currentClass);
        $("#"+this.playlistId+ " li").eq(liPos).addClass(this.currentClass);
        this.trackPos = arrayPos; // update based on array index position
				  		   document.title = x[this.trackPos].title;
						   document.getElementById("demo").innerHTML = x[this.trackPos].title;
						   	  togglePlayPause();
    }
	

playpause(){
	   togglePlayPause();
	   event.preventDefault();
      audio.paused ? audio.play() : audio.pause();
	  document.title = x[this.trackPos].title;


}

    prevTrack(){
		var btn = document.getElementById('play-pause-button');
		    var btn = $(".button");

        if(this.trackPos == 0)
            this.setTrack(0);
        else
            this.setTrack(this.trackPos - 1);
        this.player.play(); 
      btn.className = 'pause';
	  	    //togglePlayPause();
	document.title = x[this.trackPos].title;
						   document.getElementById("demo").innerHTML = x[this.trackPos].title;
						   

    }
	
nextTrack(){
var btn = document.getElementById('play-pause-button');
var btn = $(".button");
// if track isn't the last track in array of tracks, go to next track
if(this.trackPos < this.length - 1)
this.setTrack(this.trackPos+1);
else{
if(this.shuffle)
/*   this.randomizeOrder(); */
this.setTrack(0);
}
this.player.play();			
btn.className = 'pause';
//togglePlayPause();
document.title = x[this.trackPos].title;
document.getElementById("demo").innerHTML = x[this.trackPos].title;
}

	
// Assuming this.player is your audio element
this.player.addEventListener('stalled', function(event) {
        // Play the next track
        nextTrack();
});


constructor(config = {} ){
        
        /***
        *
        *       setting defaults, and initialzing player 
        *
        */
		var x = document.getElementsByClassName("oui-image-cover");
		var btn = $(".button");
		var btn = document.getElementById('play-pause-button');
        var classObj = this; // store scope for event listeners
        this.shuffle = (config.shuffle === true) ? true : false;
        this.playerId = (config.playerId) ? config.playerId : "audioPlayer";
        this.playlistId = (config.playlistId) ? config.playlistId : "playlist";
        this.currentClass = (config.currentClass) ? config.currentClass : "current-song"
        this.length = $("#"+this.playlistId+" li").length; 
        this.player = $("#"+this.playerId)[0];
        this.autoplay = (config.autoplay === true || this.player.autoplay) ? true : false;
        this.loop = (config.loop === true) ? true : false;
        this.trackPos = 0;
        this.trackOrder = [];
        for(var i = 0; i < this.length; i++){
            this.trackOrder.push(i);
        }

	
        /*       handle link click   */
	
        $("#"+this.playlistId+" li a ").click(function(e){
            e.preventDefault();
            // set track based on index of 
            classObj.setTrack(classObj.trackOrder.indexOf($(this).parent().index()));
            classObj.player.play();
document.title = x[this.trackPos].title;
document.getElementById("demo").innerHTML = x[this.trackPos].title;


        });
  
    }
}

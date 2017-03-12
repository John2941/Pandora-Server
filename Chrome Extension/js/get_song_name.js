var last_song = "-";
var last_album_art = "";
var last_coverart = '';

function time_split(time_str) {
	// Turn "0:23" into a interger of seconds
	var seconds = 0;
	var split = time_str.split(":");
	if (split[0] > 0 )
		seconds += parseInt(split[0]) * 60;
	seconds += parseInt(split[1]);
	return seconds;
};

function still_listening() {
    //console.debug("still_listening func"); 
    var adtoggle = '';
    chrome.extension.sendMessage({method: 'preventAds'},""
        function(response) {
            adtoggle = response;
            //console.debug("Adtoggle: " + adtoggle);
            if (adtoggle == 'true'){
                var doc = document.querySelector('[data-qa="keep_listening_button"]');
                if (doc != null)
                    doc.click();
            };
        });
};

function newSong(shout_again){
	song = updateSongInfo();
	//console.debug("song['song']: "+song['song']+ " - last_song: " + last_song + " - elapsedTime: " + song['elapsedTime'])
	//if (last_song != song['song'] && (song['elapsedTime'] >= 1 && song['elapsedTime'] <= 15)){
	if (last_song != song['song'] && song['elapsedTime'] >= 1){
		// Ideal time to pull new song information
		// Doesn't update the last song variable until a different song['song'] and elapsedTime between 1 and 15 seconds
		if (shout_again)
			console.debug(song);
		last_song = song['song'];
		chrome.runtime.sendMessage({method:"New Song",data:song});
		//setTimeout(function(){newSong(bool=false)},15000); // test
	}
	//else
		//setTimeout(function(){newSong(bool=true)},2000);
};

function updateSongInfo(){
	var song = {};
    song['coverart'] = document.querySelector('[class="nowPlayingTopInfo__artContainer__art"]').getAttribute("style").split('url(')[1].slice(0,-2); // /img/no_album_art.png
    //if (song['coverart'] == last_coverart)
    //   song['coverart'] = "/img/no_album_art.png";
    if (song['coverart'] == '')
        song['coverart'] = "/img/no_album_art.png";
    //last_coverart = song['coverart'];
	song['song'] = document.querySelector('[data-qa="mini_track_title"]').textContent;
	song['artist'] = document.querySelector('[class="nowPlayingTopInfo__current__artistName nowPlayingTopInfo__current__link"]').textContent;
	song['album'] = document.querySelector('[class="nowPlayingTopInfo__current__albumName nowPlayingTopInfo__current__link"]').textContent;
	song['station'] = document.querySelector('[class="StationListItem__title"]').textContent;
	song['elapsedTime'] = time_split(document.querySelector('[data-qa="elapsed_time"]').textContent);
	song['station'] = document.querySelector('[class="StationListItem__title"]').textContent;
	return song;
};

 

console.debug("Starting Listener")
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request.reply);
	if (request.reply == "song") {
		console.debug("Received request for song information from background.js");
		var song = updateSongInfo();
		console.debug(song);
		sendResponse({reply: song});
	}
});

$(document).ready(function (){
	setInterval(function () { newSong(song=true) }, 5000); // Checks for new song information to forward to the background page
	setInterval(function () { still_listening() }, 2000); // Checks for "still listening" prompt
	}
);
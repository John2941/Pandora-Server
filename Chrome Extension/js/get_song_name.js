var last_song = "-";
var last_album_art = "";
var last_coverart = '';
var adtoggle = '';

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
    chrome.runtime.sendMessage({method: 'preventAds'},
        function(response) {
            adtoggle = response;
            //console.debug("Adtoggle: " + adtoggle);
            if (adtoggle == 'true'){
                var doc = document.getElementById("still_listening_ignore");
                //console.debug("doc is " + doc);
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
    song['coverart'] = $("#playerBar > div > div:nth-child(2) > div > div > div >div >div > img").attr("src"); // /img/no_album_art.png
    if (song['coverart'] == last_coverart)
        song['coverart'] = "/img/no_album_art.png";
    if (song['coverart'] == '')
        song['coverart'] = "/img/no_album_art.png";
    last_coverart = song['coverart'];
	song['song'] = $("#trackInfo > div > div.info > div > div:nth-child(1) > a").text();
	song['artist'] = $("#trackInfo > div > div.info > div > div:nth-child(2) > a").text();
	song['album'] = $("#trackInfo > div > div.info > div > div:nth-child(3) > a").text();
	song['station'] = $("#brandingBar > div.middlecolumn > div > p").text();
	song['elapsedTime'] = time_split($("#playbackControl > div.progress > div.elapsedTime").text());
	if (song['station'] == "")
		// Use below station with pandora One
		song['station'] = $("#brandingBar > div.middlecolumn > div.stationChangeSelector > div.textWithArrow > div > p").text();
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
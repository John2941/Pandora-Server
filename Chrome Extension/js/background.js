function saveSongToServer(song){
	console.debug('Trying to send song to server');
	$.ajax({
		url:'http://127.0.0.1:8080/send',
		type:'POST',
		data:song
	}).success(function(data){
		console.debug("Song sent.");
	}).fail(function(e){
		console.debug("Something went wrong...");
	});
}

var song = {"url":""};
var last_song_url = "";


chrome.webRequest.onHeadersReceived.addListener(
	function (details) {
		for (var i = 0; i < details.responseHeaders.length; ++i) 
		// Iter through request headers to find "Content-Type" which will indicated the mp4 file
		{
		   var header_name = details.responseHeaders[i].name;
		   if (header_name == 'Content-Type')
			{
				var contentType = details.responseHeaders[i].value
				if (contentType == 'audio/mp4' || contentType == 'audio/mpeg')
				{
					console.debug("Found mp4 url");
					if (details.url)
					{
						song = {};
						song['url'] = details.url;
						song['quality'] = contentType;
					}
				}
				
			}
		}
	},
    {urls: ["http://*.pandora.com/*","http://*.p-cdn.com/access/*", "https://*.pandora.com/*","https://*.p-cdn.com/access/*"]},["responseHeaders"]
);

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.method == 'New Song'){
		//Message sent from the get_song_name.js (content.js) letting the background.js know of the new song
		for (var keys in message.data){
			song[keys] = message.data[keys];
		}
		if (song["url"] == last_song_url){
			//Url was not updated ; Means that a song wasn't downloaded from pandora when the song was changed. Likely a radio station change that had the song in cache
			//console.debug("Song URL was not updated");
		}
		else {
			last_song_url = song['url'];
			console.debug(song);
			saveSongToServer(song);
		}
    }
    if (message.method == 'preventAds'){
            sendResponse(localStorage['preventAds']);
    }
});

chrome.storage.sync.get({preventAds: true}, function (data) { 
    console.info(data);
    localStorage.preventAds = data.preventAds
    });




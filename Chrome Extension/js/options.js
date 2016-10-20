function save_options() {
    console.log('Saving');
    var adToggle = document.getElementById('adtoggle').checked;
    chrome.storage.sync.set({
        preventAds: adToggle
    }, function () {
        var status = document.getElementById('status');
        status.textContent = 'Options Saved';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
    localStorage.preventAds = adToggle;
}

function restore_options () {
    chrome.storage.sync.get({
        preventAds: true
    }, function (items) {
        document.getElementById('adtoggle').checked =  items.preventAds;
            localStorage.preventAds = items.preventAds;
    });
}

function open_url() {
     var url  = "https://github.com/John2941/Pandora-Server/blob/master/Server/PandoraServer.py" ;
     chrome.tabs.create({url: url});
}

document.addEventListener('DOMContentLoaded', restore_options );
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('serverbutton').addEventListener('click', open_url);


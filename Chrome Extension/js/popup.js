$(function() {
  $('#serverbutton').click(function() {
     var url  = "https://github.com/John2941/Pandora-Server" ;
     chrome.tabs.create({url: url});
  });
});

document.addEventListener('DOMContentLoaded');
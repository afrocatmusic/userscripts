// ==UserScript==
// @name        YouTube Music Lookup - Harmony
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/Harmony-YouTube-Music-Lookup.user.js
// @match       https://harmony.pulsewidth.org.uk/release?*
// @exclude     https://harmony.pulsewidth.org.uk/release/actions*
// @grant       none
// @version     1.1
// @author      afro
// @description Adds a YouTube Music Lookup link
// ==/UserScript==

function addYTMlink(){
  var allHeaders = Array.from(document.querySelectorAll('th'));
  var headerNames = [];
  for (var i = 0; i < allHeaders.length; i++) {
      headerNames.push(allHeaders[i].innerText);
  }
  var gtinIndex = headerNames.indexOf('GTIN');
  var barcodeArea = document.querySelectorAll('th')[gtinIndex];
  var barcode = barcodeArea.nextElementSibling.textContent;
  var searchURL = 'https://music.youtube.com/search?q=%22'+barcode.replace(/^0+/,'')+'%22';
  let a = document.createElement('a');
  let linkYTMtext = document.createTextNode('Youtube Music Lookup');
      a.appendChild(linkYTMtext);
      a.setAttribute('href',searchURL);
  let space = document.querySelector('h2.center');
      space.nextElementSibling.appendChild(a);
}

window.setTimeout(addYTMlink, 50);

// ==UserScript==
// @name        YouTube Music Lookup - Harmony
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/Harmony-YouTube-Music-Lookup.user.js
// @match       https://harmony.pulsewidth.org.uk/release?*
// @exclude     https://harmony.pulsewidth.org.uk/release/actions*
// @grant       none
// @version     1.0
// @author      afro
// @description Adds a YouTube Music Lookup link
// @run-at      document-idle
// ==/UserScript==

function addYTMlink(){

  var rawArtist = document.querySelector('.release-artist').textContent;
  var relArtist = rawArtist.slice(3);
  var relTitle = document.querySelector('.release-title').textContent;
  var rawSearchURL = 'https://music.youtube.com/search?q='+relArtist+'%20'+relTitle;
  var searchURL = rawSearchURL.replace(/&/i,'%26'); //might need to replace all the funky URL symbols...

  let a = document.createElement('a');
  let linkYTMtext = document.createTextNode('Youtube Music Lookup');
  a.appendChild(linkYTMtext);
  a.setAttribute('href',searchURL);

  let space = document.querySelector('h2.center');
  space.nextElementSibling.appendChild(a);
}

window.setTimeout(addYTMlink, 250);

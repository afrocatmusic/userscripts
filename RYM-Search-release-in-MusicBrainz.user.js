// ==UserScript==
// @name        RYM Search release in MusicBrainz
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/RYM-Search-release-in-MusicBrainz.user.js
// @match       https://rateyourmusic.com/release/*
// @grant       none
// @version     1.0
// @author      afro
// @description Adds a link to search the release in MusicBrainz
// ==/UserScript==

function addReleaseMBSearch(){
  var relTitle = document.querySelector('.album_title').innerText.replaceAll('&', '%26');
  var relArtist = document.querySelector('tr.hide-for-small > td').innerText.replaceAll('&', '%26');
  //replace & for %26 so it works when using in URL

  //creating link
  var searchURL = "https://musicbrainz.org/taglookup/index?tag-lookup.artist="+relArtist+"&tag-lookup.release="+relTitle;
  let a = document.createElement('a');
  let linkText = document.createTextNode('Search in MusicBrainz');
  a.appendChild(linkText);
  a.setAttribute('href', searchURL);
  a.target = '_blank'; //to open in new tab
  a.style.fontWeight = '900';
  a.style.marginLeft = '10px';
  a.style.fontSize = 'larger';

  //where to put the link
  let space = document.querySelector('.album_info_outer');
  space.appendChild(a);
}

window.setTimeout(addReleaseMBSearch, 10);

// ==UserScript==
// @name        MBz YouTube Music Lookup
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/MBz-YouTube-Music-Lookup.user.js
// @match       *://musicbrainz.org/release/*
// @match       *://beta.musicbrainz.org/release/*
// @match       *://musicbrainz.eu/release/*
// @exclude     /\/release\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/(discids|cover-art|aliases|tags|details|edit|edit-relationships)/
// @grant       none
// @version     1.1
// @author      afro
// @description Add a YouTube Music Lookup button
// @run-at      document-idle
// ==/UserScript==

//Other comments because I don't know what I'm doing:
//This thing is heavily based on atj's "MusicBrainz: Add Spotify ISRC link to release pages" script
//which can be found here - https://github.com/atj/userscripts#add-a-link-to-musicbrainz-to-import-isrcs

//also took some bits from the following sources:
//https://www.reddit.com/r/GreaseMonkey/comments/kefmlb/how_do_i_create_a_button_on_tampermonkey_that/
//https://stackoverflow.com/questions/7554108/javascript-window-location-in-new-tab
//im gonna be honest idk if this stuff matters but im including it just to be safe

//rest of it is me bashing my head against google

function addYTMbtn(){

//many thanks to kellnerd for helping me figure this part out - https://github.com/kellnerd
  var relTitle = document.querySelector('div.releaseheader > h1 a > bdi').textContent.replaceAll('&','%26');
  var relArtist = Array.from(document.querySelectorAll('div.releaseheader a[href^="/artist/"] > bdi'), (element) => element.textContent).join(' ').replaceAll('&','%26');

  let btnYTMLookup = document.createElement("BUTTON");
      btnYTMLookup.innerText = 'YouTube Music Lookup';
      btnYTMLookup.title = 'Search "'+relArtist.replaceAll('%26','&')+' '+relTitle.replaceAll('%26','&')+'" on YouTube Music'
      btnYTMLookup.style.cursor = 'pointer'
      btnYTMLookup.onclick = () => {
        window.open('https://music.youtube.com/search?q='+relArtist+'%20'+relTitle, '_blank');
        };
  let div = document.querySelector('div.tracklist-and-credits');
      div.appendChild(btnYTMLookup);
}

window.setTimeout(addYTMbtn, 50);

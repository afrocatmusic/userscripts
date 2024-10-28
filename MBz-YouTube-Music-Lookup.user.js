// ==UserScript==
// @name        MBz YouTube Music Lookup
// @namespace   Violentmonkey Scripts
// @match       *://musicbrainz.*/release*
// @grant       none
// @version     1.0
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

//these need to be fixed, using this querySelector thingy doesn't always fetch the artist, or more than one artist
  var relTitle = document.querySelector('div.wrap-anywhere > h1:nth-child(4) > a:nth-child(1) > bdi:nth-child(1)').textContent;
  var relArtist = document.querySelector('.subheader > a:nth-child(2) > bdi:nth-child(1)').textContent;

//could do some styling on the actual button but it just working is enough for me rn
  let btnYTMLookup = document.createElement("BUTTON");
    btnYTMLookup.innerText = 'YouTube Music Lookup';
    btnYTMLookup.onclick = () => {
      window.open('https://music.youtube.com/search?q='+relArtist+'%20'+relTitle, '_blank');
      };

  let div = document.querySelector('div.tracklist-and-credits');
    div.appendChild(btnYTMLookup);
}


window.setTimeout(addYTMbtn, 250);
// ==UserScript==
// @name        MBz search RYM
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/MBz-search-RYM.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/MBz-search-RYM.js
// @match       *://musicbrainz.org/release-group/*
// @match       *://beta.musicbrainz.org/release-group/*
// @match       *://musicbrainz.eu/release-group/*
// @exclude     /\/release-group\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/(aliases|tags|details|edits|open_edits)/
// @exclude     /\/release-group\/add/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @version     1.0
// @author      afro
// @description Adds a button to find the current release group in RateYourMusic
// ==/UserScript==

function addRYMSearch() {
  if (document.getElementById('content').innerText.search('rateyourmusic.com') > -1) { //check if there's a rym link here already
  return;
} else {
        //the area for the rg title changes if there's an open edit pending, so we gotta check first
        if (document.querySelector('.wrap-anywhere > h1 > a > bdi') === null) { //check this area first, if it doesn't exist, then...
                var rgTitle = document.querySelector('.wrap-anywhere > h1 > span > a > bdi').innerText.replaceAll('&','%26');
        } else {
                var rgTitle = document.querySelector('.wrap-anywhere > h1 > a > bdi').innerText.replaceAll('&','%26');
        }

        var rgArtist = document.querySelector('.subheader').innerText.replaceAll('~ Release group by ','').replaceAll('&','%26');
        //we're using google instead of the native RYM search, because it sucks!
        var rymSearchURL = 'https://www.google.com/search?q='+rgTitle.replaceAll(' ','+')+'+by+'+rgArtist.replaceAll(' ','+')+'+site%3Arateyourmusic.com';
        var rymBTN = document.createElement('button');
        var rymLogo = new Image(20, 20);
            rymLogo.src = 'https://upload.wikimedia.org/wikipedia/en/d/d0/Rate_Your_Music_logo.svg';
        var searchlogo = new Image(10, 10);
            searchlogo.src = 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Magnifying_glass_Icon.png';
            //one day i'll figure out how to put these images on top of each other, for now they're next to each other
            rymBTN.appendChild(rymLogo);
            rymBTN.appendChild(searchlogo);
            rymBTN.title = 'Search in RateYourMusic';
            rymBTN.setAttribute('style', 'border: 0px; background: none; cursor: pointer; ');
            rymBTN.onclick = () => {
                   window.open(rymSearchURL, '_blank');
                   };
        var where = document.querySelector('ul.tabs'); //I'm still not sure if this is the best place for it, tbh
            where.appendChild(rymBTN);
       }
}

window.setTimeout(addRYMSearch, 50);

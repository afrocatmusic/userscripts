// ==UserScript==
// @name        afro's RG Search Utilities
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-RG-Search-Utilities.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-RG-Search-Utilities.user.js
// @match       *://musicbrainz.org/release-group/*
// @match       *://beta.musicbrainz.org/release-group/*
// @match       *://musicbrainz.eu/release-group/*
// @exclude     /\/release-group\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/(aliases|tags|details|edits|open_edits)/
// @exclude     /\/release-group\/add/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @version     1.0
// @author      afro
// @description Adds buttons to find the current release group in various websites
// ==/UserScript==

function getTitle(rgTitle){
  rgTitle = $('.subheader')[0].previousElementSibling.querySelector('a').innerText;
  rgTitle = encodeURIComponent(rgTitle);
  return rgTitle;
}
function getArtist(rgArtist){
  rgArtist = $('.subheader > bdi')[0].innerText;
  rgArtist = encodeURIComponent(rgArtist);
  return rgArtist;
}
function searchLogo(searchlogo){
  searchlogo = new Image(10, 10);
  searchlogo.src = 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Magnifying_glass_Icon.png';
  return searchlogo;
}
function addRYMSearch() {
  if ($('#content')[0].innerText.search('rateyourmusic.com') > -1) {
  return;
  } else {
    var rymSearchURL = 'https://www.google.com/search?q='+getTitle()+'+by+'+getArtist()+'+site:rateyourmusic.com';
    var rymBTN = document.createElement('button');
    var rymLogo = new Image(20, 20);
        rymLogo.src = 'https://upload.wikimedia.org/wikipedia/en/d/d0/Rate_Your_Music_logo.svg';
        rymBTN.appendChild(rymLogo);
        rymBTN.appendChild(searchLogo());
        rymBTN.title = 'Search RateYourMusic.com';
        rymBTN.setAttribute('style', 'display: inline-block; border-radius: 50%; border: 0px; background: none; cursor: pointer; ');
        rymBTN.onclick = () => {
          window.open(rymSearchURL, '_blank');
          };
    $('ul.tabs')[0].appendChild(rymBTN);
  }
}
function addGeniusSearch() {
  if ($('#content')[0].innerText.search('genius.com') > -1) {
    return;
  } else {
  let geniusSearchURL = 'https://genius.com/search?q='+getArtist()+' '+getTitle();
  let geniusBTN = document.createElement('button');
  let geniusLogo = new Image(20, 20);
      geniusLogo.src = 'https://upload.wikimedia.org/wikipedia/commons/6/67/G_in_Genius.svg';
      geniusLogo.style.borderRadius = '50%';
      geniusBTN.setAttribute('style','display: inline-block; border: 0px; background: none; cursor: pointer; margin-left: 10px;');
      geniusBTN.title = 'Search Genius.com';
      geniusBTN.appendChild(geniusLogo);
      geniusBTN.appendChild(searchLogo());
      geniusBTN.onclick = () => {
        window.open(geniusSearchURL, '_blank');
      };
      $('ul.tabs')[0].appendChild(geniusBTN);
  }
}
function addWDSearch() {
  if ($('#content')[0].innerHTML.search('wikidata.org') > -1) {
    return;
  } else {
    let wdSearchURL = 'https://www.wikidata.org/w/index.php?search='+getArtist()+'+'+getTitle();
    let wdButton = document.createElement('button');
    let wdLogo = new Image(20,20);
        wdLogo.src = 'https://www.wikidata.org/static/images/icons/wikidatawiki.svg';
        wdButton.setAttribute('style','display: inline-block; border: 0px; background: none; cursor: pointer; margin-left: 10px;');
        wdButton.title = 'Search Wikdata.org';
        wdButton.appendChild(wdLogo);
        wdButton.appendChild(searchLogo());
        wdButton.onclick = () => {
          window.open(wdSearchURL, '_blank');
        };
        $('ul.tabs')[0].appendChild(wdButton);
  }
}
function addAllMusicSearch() {
  if ($('#content')[0].innerHTML.search('allmusic.com') > -1) {
    return;
  } else {
    let allMusicSearchURL = 'https://www.allmusic.com/search/albums/'+getArtist()+'+'+getTitle();
    let allMusicButton = document.createElement('button');
    let allMusicLogo = new Image(20,20);
        allMusicLogo.src = 'https://upload.wikimedia.org/wikipedia/commons/a/a0/AllMusic_Logo.svg';
        allMusicButton.setAttribute('style','display: inline-block; border: 0px; background: none; cursor: pointer; margin-left: 10px;');
        allMusicButton.title = 'Search AllMusic.com';
        allMusicButton.appendChild(allMusicLogo);
        allMusicButton.appendChild(searchLogo());
        allMusicButton.onclick = () => {
          window.open(allMusicSearchURL, '_blank');
        };
        $('ul.tabs')[0].appendChild(allMusicButton);
  }
}
window.setTimeout(function() {
  addRYMSearch();
  addGeniusSearch();
  addWDSearch();
  addAllMusicSearch();
}, 50);

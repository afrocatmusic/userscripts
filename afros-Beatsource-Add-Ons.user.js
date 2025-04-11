// ==UserScript==
// @name        afro's Beatsource Add-Ons
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-Beatsource-Add-Ons.user.js
// @match       https://www.beatsource.com/*
// @grant       none
// @version     1.0
// @author      afro
// @description Adds some extra info to beatsource release pages + handy links for importing into MusicBrainz
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

//Important, forces reload when clicking a link
//Needs to happen for the info to update
function linkMe(){
  var links = $('a');
      for (var i = links.length - 1; i >= 0; i--) {
      links[i].setAttribute('target','_top')
      };
  }
function findStuff(){
  if (window.location.href.search(/\/release\//) > -1) {
    var area = $('[data-testid="col-sidebar"]')[0]
    var rawReleaseInfo = document.documentElement.outerHTML.match(/(?<="pageProps")(.*)(?<=moreFromArtist)/g)[0]; //grab the relevant chunk only
    var barcode = rawReleaseInfo.match(/(?<="upc":")[0-9]*/g)[0];
    var catNum = rawReleaseInfo.match(/(?<=catalog_number":")(.*?)(?=")/g)[0];
    var isrc = rawReleaseInfo.match(/(?<=isrc":")(.*?)(?=")/g)[0];
    var relTitle = rawReleaseInfo.match(/(?<=\d{3,},"name":")(.*?)(?=","image")/g)[0];
    var isrcList = rawReleaseInfo.match(/(?<=isrc":")(.*?)(?=")/g);

    var infoContainer = document.createElement('div');
        infoContainer.setAttribute('id','infoContainer')
        infoContainer.setAttribute('style','font-size: 1.5rem; color: #415974; line-height: 2.5rem; padding-bottom: 1.5rem; margin-top: 1.5rem; white-space: pre-line')
        area.appendChild(infoContainer);
    var newline = document.createTextNode('\n');

    var relTitleDisplay = document.createTextNode('Title: '+relTitle.replaceAll('&amp;','&'));
    var barcodeDisplay = document.createTextNode('Barcode: '+barcode);
    var barcodeAnchor = document.createElement('a');
        barcodeAnchor.appendChild(barcodeDisplay);
        barcodeAnchor.setAttribute('href','https://harmony.pulsewidth.org.uk/release?category=preferred&gtin='+barcode);
        barcodeAnchor.setAttribute('style','color: #415974');
    var catDisplay = document.createTextNode('Catalog Number: '+catNum);
    var isrcDisplay = document.createTextNode('ISRC: '+isrc);

//thanks to https://github.com/Onteia for helping with this bit
    var magicISRCURL = "https://magicisrc.kepstin.ca/?";
        for(let i = 1; i < isrcList.length+1; i++) {
            magicISRCURL = magicISRCURL + "isrc" + i + "=" + isrcList[i-1] + "&";
        }
        magicISRCURL = magicISRCURL.slice(0,-1);
        magicISRCURL = magicISRCURL+'&edit-note=Import+ISRCs+from+'+window.location.href+'+using+https://github.com/afrocatmusic/userscripts/blob/main/afros-Beatsource-Add-Ons.user.js';
    var magicISRCDisplay = document.createTextNode('Submit ISRCs');
    var magicISRCAnchor = document.createElement('a');
        magicISRCAnchor.appendChild(magicISRCDisplay);
        magicISRCAnchor.setAttribute('href',magicISRCURL);
        magicISRCAnchor.setAttribute('style','color: #415974');

        infoContainer.append(relTitleDisplay, newline, barcodeAnchor, newline.cloneNode(),catDisplay,newline.cloneNode(),magicISRCAnchor);
  }
}
window.setTimeout(findStuff,50);
window.setTimeout(linkMe,50);

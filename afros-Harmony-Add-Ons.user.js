// ==UserScript==
// @name        afro's Harmony Add-Ons
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @match       https://harmony.pulsewidth.org.uk/release?*
// @version     1.0
// @author      afro
// @grant       GM_setClipboard
// @grant       GM.setClipboard
// @description Adds extra lookup options and various "copy to clipboard" functions to Harmony's release pages
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require     https://raw.githubusercontent.com/jpillora/notifyjs/refs/heads/master/dist/notify.js
// ==/UserScript==

function addSearchLinks(){
  var separator = document.createTextNode(' | ');
//deal with VA
  if ($('.artist-credit')[0].childElementCount < 5) {
        var relArtist = $('.release-artist')[0].textContent.slice(3).replaceAll('&','%26').replaceAll('/',' ');
    } else {
        var relArtist = 'Various Artists';
    }
  var relTitle = $('.release-title')[0].textContent.replaceAll('&','%26').replaceAll('/',' ');
//youtube music search (not used anymore)
  var ytSearchURL = 'https://music.youtube.com/search?q='+relArtist+'%20'+relTitle;
  var linkYTMtext = document.createTextNode('Search in YouTube Music');
  var ytAnchor = document.createElement('a');
      ytAnchor.appendChild(linkYTMtext);
      ytAnchor.setAttribute('href',ytSearchURL);
//YTM barcode lookup
  var allHeaders = Array.from($('th'));
  var headerNames = [];
  for (var i = 0; i < allHeaders.length; i++) {
     headerNames.push(allHeaders[i].innerText);
  }
  var gtinIndex = headerNames.indexOf('GTIN');
  var barcodeArea = $('th')[gtinIndex];
  var barcode = barcodeArea.nextElementSibling.textContent.replace(/^0+/,'');

  var ytRelURL = 'https://music.youtube.com/search?q=%22'+barcode+'%22';
  var ytReleaseLink = document.createTextNode('Search in YouTube Music');
      ytReleaseLink.title = 'Experimental';
  var ytRelAnchor = document.createElement('a');
      ytRelAnchor.appendChild(ytReleaseLink);
      ytRelAnchor.setAttribute('href',ytRelURL);
//qobuz
//localization
  var qbzRegion;
  var region = $('#region-input')[0].value.toLowerCase();
  var regionMap = new Map([
    ['ar','ar-es'],
    ['au','au-en'],
    ['at','at-de'],
    ['be','be-nl'],
    ['br','br-pt'],
    ['ca','ca-en'],
    ['cl','cl-es'],
    ['co','co-es'],
    ['dk','dk-en'],
    ['fi','fi-en'],
    ['fr','fr-fr'],
    ['de','de-de'],
    ['ie','ie-en'],
    ['it','it-it'],
    ['jp','jp-ja'],
    ['lu','lu-de'],
    ['mx','mx-es'],
    ['nl','nl-nl'],
    ['nz','nz-en'],
    ['no','no-en'],
    ['pt','pt-pt'],
    ['es','es-es'],
    ['se','se-en'],
    ['ch','ch-de'],
    ['gb','gb-en'],
    ['us','us-en'],
  ]);
    if (regionMap.has(region) === true){qbzRegion = regionMap.get(region)}
    else if (region.search(',') > -1){qbzRegion = regionMap.get(region.slice(0,2))} //if more than one, default to the first one
    else {qbzRegion = 'us-en'} //any other region, default to us
  var qbzSearchURL = 'https://www.qobuz.com/'+qbzRegion+'/search/albums/'+relArtist+'%20'+relTitle;
  var linkQbzText = document.createTextNode('Search in Qobuz');
  var qbzAnchor = document.createElement('a');
      qbzAnchor.appendChild(linkQbzText);
      qbzAnchor.setAttribute('href',qbzSearchURL);
//beatsource
  var btsSearchURL = 'https://www.beatsource.com/search/releases?q='+relArtist+'%20'+relTitle;
  var linkBtsText = document.createTextNode('Search in Beatsource');
  var btsAnchor = document.createElement('a');
      btsAnchor.appendChild(linkBtsText);
      btsAnchor.setAttribute('href',btsSearchURL);
//placing
  var space = $('h2.center')[0];
      space.nextElementSibling.append(qbzAnchor,separator,ytRelAnchor,separator.cloneNode(),btsAnchor);
}

function copyLinks(){
  var allHeaders = Array.from($('th'));
  var headerNames = [];
  for (var i = 0; i < allHeaders.length; i++) {
     headerNames.push(allHeaders[i].innerHTML);
  }
  var extLinksIndex = headerNames.indexOf('External links'); //position of external links text in the table
  var exLiArea = $('th')[extLinksIndex];
  var links = Array.from(exLiArea.nextElementSibling.querySelectorAll('a')).toString().split(',').join('\n');

  var extAnchor = document.createElement('a');
      extAnchor.textContent = 'External links';
      extAnchor.title = 'Click to copy external links';
      extAnchor.addEventListener("click", () => writeClipboardText(links));
                    async function writeClipboardText(text) {
                        try {
                          await navigator.clipboard.writeText(text);
                        } catch (error) {
                          console.error(error.message);
                        }
                      }
      exLiArea.innerText = '';
      exLiArea.appendChild(extAnchor);
      extAnchor.setAttribute('style', 'cursor: pointer; text-decoration: underline; color: white;');
      extAnchor.addEventListener("click", () => showCopyNotif());
                  function showCopyNotif() {
                    $.notify('Copied!',{ autoHideDelay:'1500', className:'success', position:'bottom'});
                  }

      extAnchor.onmouseover = function() {mouseOver()};
      extAnchor.onmouseout = function() {mouseOut()};
                    function mouseOver() {
                      extAnchor.style.color = "#add8e6";
                    }

                    function mouseOut() {
                      extAnchor.style.color = "initial";
                    }
}

function copyBarcode(){
  var allHeaders = Array.from($('th'));
  var headerNames = [];
  for (var i = 0; i < allHeaders.length; i++) {
     headerNames.push(allHeaders[i].innerText);
  }
  var gtinIndex = headerNames.indexOf('GTIN');
  var barcodeArea = $('th')[gtinIndex];
  var barcode = barcodeArea.nextElementSibling.textContent;
  //create copyable link over GTIN text
  var barcodeAnchor = document.createElement('a');
      barcodeAnchor.textContent = 'GTIN';
      barcodeAnchor.title = 'Click to copy';
  var copyableAreas = [barcodeAnchor, barcodeArea, barcodeArea.nextElementSibling]; //make the whole area clickable
      copyableAreas.forEach(function(elem){
        elem.addEventListener("click", () => writeClipboardTextBarcode(barcode));
                      async function writeClipboardTextBarcode(text) {
                        try {
                          await navigator.clipboard.writeText(text);
                        } catch (error) {
                          console.error(error.message);
                        }
                      }
        elem.addEventListener("click", () => showCopyNotif()); //and also give notif
        function showCopyNotif() {
          $.notify('Copied!',{ autoHideDelay:'1500', className:'success', position:'bottom'});
        }
        });
      barcodeArea.innerText = '';
      barcodeArea.appendChild(barcodeAnchor);
      barcodeAnchor.setAttribute('style', 'cursor: pointer; text-decoration: underline dotted; color: white;');
      barcodeAnchor.addEventListener("click", () => showCopyNotif());
        function showCopyNotif() {
          $.notify('Copied!',{ autoHideDelay:'1500', className:'success', position:'bottom'});
        }
      barcodeAnchor.onmouseover = function() {mouseOver()};
      barcodeAnchor.onmouseout = function() {mouseOut()};
        function mouseOver() {
          barcodeAnchor.style.color = "#add8e6";
          }
        function mouseOut() {
          barcodeAnchor.style.color = "initial";
          }
      barcodeArea.setAttribute('style','background: #162dab; padding: 1em; cursor: pointer;');
      barcodeArea.nextElementSibling.setAttribute('style','background: #162dab; cursor: pointer;');
}

function copyCountries() {
  var allHeaders = Array.from($('th'));
  var headerNames = [];
  for (var i = 0; i < allHeaders.length; i++) {
     headerNames.push(allHeaders[i].innerText);
  }

  var today = new Date().toISOString().slice(0, 10);
  var unavailIndex = headerNames.indexOf('Unavailability');
  var unavailArea = $('th')[unavailIndex];
  var unavailableCountries;
  var unavailAnchor = document.createElement('a');
      unavailAnchor.textContent = 'Unavailability';
      unavailAnchor.title = 'Click to copy';
      unavailAnchor.addEventListener("click", () => writeClipboardTextBarcode(unavailableCountries));
                    async function writeClipboardTextBarcode(text) {
                      try {
                        await navigator.clipboard.writeText(text);
                      } catch (error) {
                        console.error(error.message);
                      }
                    }
      unavailArea.innerText = '';
      unavailArea.appendChild(unavailAnchor);
      unavailAnchor.setAttribute('style', 'cursor: pointer; text-decoration: underline dotted; color: white;');
      unavailAnchor.addEventListener("click", () => showCopyNotif());
        function showCopyNotif() {
          $.notify('Copied!',{ autoHideDelay:'1500', className:'success', position:'bottom'});
        }
      unavailAnchor.onmouseover = function() {mouseOver()};
      unavailAnchor.onmouseout = function() {mouseOut()};
        function mouseOver() {
          unavailAnchor.style.color = "#add8e6";
          unavailableCountries = 'Unavailable in these regions, as of '+today+':\n' + unavailArea.nextElementSibling.textContent.replaceAll(')',')\n').replace(/\n.*$/, '').replaceAll('(Keeling)\n Islands','(Keeling) Islands');
          }
        function mouseOut() {
          unavailAnchor.style.color = "initial";
          }
}

function copyPermalink() {
  var permaLink = $('p.center > a')[0];
  var permaLinkURL = permaLink.href;
      permaLink.href = "javascript:void(0);";
      permaLink.addEventListener("click", () => writeClipboardTextBarcode(permaLinkURL));
                    async function writeClipboardTextBarcode(text) {
                      try {
                        await navigator.clipboard.writeText(text);
                      } catch (error) {
                        console.error(error.message);
                      }
                    }
}

window.setTimeout(function() {
  addSearchLinks();
  copyLinks();
  copyBarcode();
  copyCountries();
  copyPermalink();
}, 50);

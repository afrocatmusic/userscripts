// ==UserScript==
// @name        afro's Harmony Add-Ons
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @match       https://harmony.pulsewidth.org.uk/release?*
// @version     1.1
// @author      afro
// @grant       GM_setClipboard
// @grant       GM.setClipboard
// @description Adds extra lookup options and various "copy to clipboard" functions to Harmony's release pages
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require     https://raw.githubusercontent.com/jpillora/notifyjs/refs/heads/master/dist/notify.js
// ==/UserScript==

async function writeClipboardText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error.message);
    }
}
function showCopyNotif() {
  $.notify('Copied!',{autoHideDelay:'1500', className:'success', position:'bottom'});
}

function addSearchLinks(){
  var separator = document.createTextNode(' | ');
//deal with VA
  let relArtist = '';
  if ($('.artist-credit')[0].childElementCount < 5) {
        relArtist = $('.release-artist')[0].textContent.slice(3).replaceAll('&','%26').replaceAll('/',' ');
    } else {
        relArtist = 'Various Artists';
    }
  var relTitle = $('.release-title')[0].textContent.replaceAll('&','%26').replaceAll('/',' ');
//YTM barcode lookup
  var allHeaders = $('th');
  var headerNames = [];
  for (var i = 0; i < allHeaders.length; i++) {
    headerNames.push(allHeaders[i].innerText);
  }
  var gtinIndex = headerNames.indexOf('GTIN');
  var barcodeArea = $('th')[gtinIndex];
  var barcode = barcodeArea.nextElementSibling.textContent.replace(/^0+/,''); //remove leading zeroes
  var ytRelURL = 'https://music.youtube.com/search?q=%22'+barcode+'%22';
  var ytReleaseLink = document.createTextNode('Search YouTube Music');
  var ytRelAnchor = document.createElement('a');
      ytRelAnchor.appendChild(ytReleaseLink);
      ytRelAnchor.setAttribute('href',ytRelURL);
//qobuz
  var qbzRegion;
  let defaultQbzRegion = 'us-en'; //feel free to change
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
  if (region.includes(',')) { //if multiple regions, use the first one that exists in regionMap
    let regionTest = region.split(',');
    for (let i = 0; i < regionTest.length; i++) {
      if (regionMap.has(regionTest[i])) {
        qbzRegion = regionMap.get(regionTest[i]);
        break;
      }
    }
      if (qbzRegion === undefined) { //if it's all unsuported regions
        qbzRegion = defaultQbzRegion;
      }
  }
  else if (regionMap.has(region) === true) { //if it's only one supported region
    qbzRegion = regionMap.get(region);
  }
  else if (regionMap.has(region) === false) { //if it's one unsupported region
    qbzRegion = defaultQbzRegion;
  }
  var qbzSearchURL = 'https://www.qobuz.com/'+qbzRegion+'/search/albums/'+relArtist+'%20'+relTitle;
  var linkQbzText = document.createTextNode('Search Qobuz');
  var qbzAnchor = document.createElement('a');
      qbzAnchor.appendChild(linkQbzText);
      qbzAnchor.setAttribute('href',qbzSearchURL);
//beatsource
  var btsSearchURL = 'https://www.beatsource.com/search/releases?q='+relArtist+'%20'+relTitle;
  var linkBtsText = document.createTextNode('Search Beatsource');
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
      exLiArea.setAttribute('style','background: rgba(22, 45, 171, 0.3)');
  var links = Array.from(exLiArea.nextElementSibling.querySelectorAll('a')).toString().split(',').join('\n');

  var extAnchor = document.createElement('a');
      extAnchor.textContent = 'External links';
      extAnchor.title = 'Click to copy external links';
      extAnchor.addEventListener("click", () => writeClipboardText(links));
      exLiArea.innerText = '';
      exLiArea.appendChild(extAnchor);
      extAnchor.setAttribute('style', 'cursor: pointer; text-decoration: underline dotted; color: white;');
      extAnchor.addEventListener("click", () => showCopyNotif());
      extAnchor.onmouseover = function() {mouseOver();};
      extAnchor.onmouseout = function() {mouseOut();};
        function mouseOver() {
          extAnchor.style.color = "#add8e6";
        }

        function mouseOut() {
          extAnchor.style.color = "white";
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
  var barcodeAnchor = document.createElement('a');
      barcodeAnchor.textContent = 'GTIN';
      barcodeAnchor.title = 'Click to copy';
  var copyableAreas = [barcodeArea, barcodeArea.nextElementSibling]; //make the whole area clickable
      copyableAreas.forEach(function(elem){
        elem.addEventListener("click", () => writeClipboardText(barcode));
        elem.addEventListener("click", () => showCopyNotif());
        });
      barcodeArea.innerText = '';
      barcodeArea.appendChild(barcodeAnchor);
      barcodeAnchor.setAttribute('style', 'cursor: pointer; text-decoration: underline dotted; color: white;');
      barcodeAnchor.onmouseover = function() {mouseOver();};
      barcodeAnchor.onmouseout = function() {mouseOut();};
        function mouseOver() {
          barcodeAnchor.style.color = "#add8e6";
          }
        function mouseOut() {
          barcodeAnchor.style.color = "white";
          }
      barcodeArea.setAttribute('style','background: rgba(22, 45, 171, 0.3); padding: 1em; cursor: pointer;');
      barcodeArea.nextElementSibling.setAttribute('style','background: rgba(22, 45, 171, 0.3); cursor: pointer;');
}

function copyCountries() {
  if ($('.release-info')[0].innerText.search('Unavailability') === -1) {
    return;
  } else {
      var allHeaders = Array.from($('th'));
      var headerNames = [];
      for (var i = 0; i < allHeaders.length; i++) {
         headerNames.push(allHeaders[i].innerText);
      }
      var today = new Date().toISOString().slice(0, 10);
      var unavailIndex = headerNames.indexOf('Unavailability');
      var unavailArea = $('th')[unavailIndex];
          unavailArea.setAttribute('style','background: rgba(22, 45, 171, 0.3); padding: 1em;');
      var expandButton = unavailArea.nextElementSibling.querySelector('button');
          if (expandButton === null) {return;}
          else {
            expandButton.click(); //make sure list is expanded by default
          }
      var unavailableCountries;
      var unavailAnchor = document.createElement('a');
          unavailAnchor.textContent = 'Unavailability';
          unavailAnchor.setAttribute('style','text-decoration: underline dotted;');
          unavailAnchor.title = 'Click to copy';
          unavailAnchor.addEventListener("click", () => writeClipboardText(unavailableCountries));
          unavailArea.innerText = '';
          unavailArea.appendChild(unavailAnchor);
          unavailAnchor.setAttribute('style', 'cursor: pointer; text-decoration: underline dotted; color: white;');
          unavailAnchor.addEventListener("click", () => showCopyNotif());
          unavailAnchor.onmouseover = function() {mouseOver();};
          unavailAnchor.onmouseout = function() {mouseOut();};
            function mouseOver() {
              unavailAnchor.style.color = "#add8e6";
              if (unavailArea.nextElementSibling.innerText.split('\n').length > 30) {
                unavailableCountries = 'Unavailable in these regions, as of '+today+':\n' + unavailArea.nextElementSibling.innerText
                  .replace(/(.*regionsCollapse)/gm,'')
                  .replace(/^(.*)\n(.*)\n(.*)/gm,'$1 $2 $3')
                  .replace(/ $/gm,'');
                } else {
                  unavailableCountries = 'Unavailable in these regions, as of '+today+':\n' + unavailArea.nextElementSibling.innerText.replace(/(.*regionsCollapse)/gm,'');
                }
            }
            function mouseOut() {
              unavailAnchor.style.color = "white";
              }
  }
}
function copyPermalink() {
  var permaLink = $('p.center > a')[0];
  var permaLinkURL = permaLink.href;
      permaLink.href = "javascript:void(0);";
      permaLink.addEventListener("click", () => writeClipboardText(permaLinkURL));
}

window.setTimeout(function() {
  addSearchLinks();
  copyLinks();
  copyBarcode();
  copyCountries();
  copyPermalink();
}, 60);

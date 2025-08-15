// ==UserScript==
// @name        afro's Harmony Add-Ons
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @match       https://harmony.pulsewidth.org.uk/release?*
// @version     1.2
// @author      afro
// @grant       GM_setClipboard
// @grant       GM.setClipboard
// @description Adds extra lookup options and various "copy to clipboard" functions to Harmony's release pages
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require     https://raw.githubusercontent.com/jpillora/notifyjs/refs/heads/master/dist/notify.js
// ==/UserScript==
function css() {
  let head = document.getElementsByTagName('head')[0];
  if (head) {
    let style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.textContent = `
    .copyable-background {
      background: rgba(22, 45, 171, 0.3);
      padding: 0.5em;
      }
    .copyable-text {
      color: white;
      text-decoration: underline dotted;
      cursor: pointer;
    }
    .copyable-text:hover {
      color: #add8e6;
    }
      `;
    head.appendChild(style);
    }
}
css();
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

//--- add search links for youtube music, qobuz, and beatsource
function addSearchLinks(){
  let separator = document.createTextNode(' | ');
  //deal with VA
  let relArtist = '';
  if ($('.artist-credit')[0].childElementCount < 5) {
        relArtist = $('.release-artist')[0].textContent.slice(3).replaceAll('&','%26').replaceAll('/',' ');
    } else {
        relArtist = 'Various Artists';
    }
  let relTitle = $('.release-title')[0].textContent.replaceAll('&','%26').replaceAll('/',' ');
  //YTM barcode lookup
  let allHeaders = $('th');
  let headerNames = [];
  for (let i = 0; i < allHeaders.length; i++) {
    headerNames.push(allHeaders[i].innerText);
  }
  let gtinIndex = headerNames.indexOf('GTIN');
  let barcodeArea = $('th')[gtinIndex];
  let barcode = barcodeArea.nextElementSibling.textContent.replace(/^0+/,''); //remove leading zeroes
  let ytRelURL = `https://music.youtube.com/search?q="${barcode}"`;
  let ytReleaseLink = document.createTextNode('Search YouTube Music');
  let ytRelAnchor = document.createElement('a');
      ytRelAnchor.appendChild(ytReleaseLink);
      ytRelAnchor.setAttribute('href',ytRelURL);
  //qobuz
  let defaultQbzRegion = 'us-en'; //feel free to change
  let regionInput = $('#region-input').val().toLowerCase();
  const regionMap = {
    ar: 'ar-es', au: 'au-en', at: 'at-de', be: 'be-nl', br: 'br-pt',
    ca: 'ca-en', cl: 'cl-es', co: 'co-es', dk: 'dk-en', fi: 'fi-en',
    fr: 'fr-fr', de: 'de-de', ie: 'ie-en', it: 'it-it', jp: 'jp-ja',
    lu: 'lu-de', mx: 'mx-es', nl: 'nl-nl', nz: 'nz-en', no: 'no-en',
    pt: 'pt-pt', es: 'es-es', se: 'se-en', ch: 'ch-de', gb: 'gb-en',
    us: 'us-en'
  };
  let regionKey = regionInput.split(',').map(code => code.trim()).find(code => regionMap[code]);
  let qbzRegion = regionMap[regionKey] || defaultQbzRegion;

  let qbzSearchURL = `https://www.qobuz.com/${qbzRegion}/search/albums/${relArtist} ${relTitle}`;
  let linkQbzText = document.createTextNode('Search Qobuz');
  let qbzAnchor = document.createElement('a');
      qbzAnchor.appendChild(linkQbzText);
      qbzAnchor.setAttribute('href',qbzSearchURL);
  //beatsource
  let btsSearchURL = `https://www.beatsource.com/search/releases?q=${relArtist} ${relTitle}`;
  let linkBtsText = document.createTextNode('Search Beatsource');
  let btsAnchor = document.createElement('a');
      btsAnchor.appendChild(linkBtsText);
      btsAnchor.setAttribute('href', btsSearchURL);
  //placing
  let space = $('h2.center')[0];
      space.nextElementSibling.append(qbzAnchor,separator,ytRelAnchor,separator.cloneNode(),btsAnchor);
}
addSearchLinks();

//--- copy external links
function copyLinks(){
  let allHeaders = $('th');
  let headerNames = [];
  for (let i = 0; i < allHeaders.length; i++) {
     headerNames.push(allHeaders[i].innerHTML);
  }
  let extLinksIndex = headerNames.indexOf('External links'); //position of external links text in the table
  let exLiArea = $('th')[extLinksIndex];
      exLiArea.setAttribute('class','copyable-background');
  let links = Array.from(exLiArea.nextElementSibling.querySelectorAll('a')).toString().split(',').join('\n');

  let extAnchor = document.createElement('a');
      extAnchor.textContent = 'External links';
      extAnchor.title = 'Click to copy external links';
      extAnchor.addEventListener("click", () => {
        writeClipboardText(links);
        showCopyNotif();
      });
      exLiArea.innerText = '';
      exLiArea.appendChild(extAnchor);
      extAnchor.setAttribute('class','copyable-text');
}
copyLinks();

//--- copy GTIN / barcode
function copyBarcode(){
  let allHeaders = Array.from($('th'));
  let headerNames = [];
  for (let i = 0; i < allHeaders.length; i++) {
     headerNames.push(allHeaders[i].innerText);
  }
  let gtinIndex = headerNames.indexOf('GTIN');
  let barcodeArea = $('th')[gtinIndex];
  let barcode = barcodeArea.nextElementSibling.textContent;
  let barcodeAnchor = document.createElement('a');
      barcodeAnchor.textContent = 'GTIN';
      barcodeAnchor.title = 'Click to copy';
  let copyableAreas = [barcodeArea, barcodeArea.nextElementSibling]; //make the whole area clickable
      copyableAreas.forEach(function(elem){
        elem.addEventListener("click", () => {
            writeClipboardText(barcode);
            showCopyNotif();
        });
      });
      barcodeArea.innerText = '';
      barcodeArea.appendChild(barcodeAnchor);
      barcodeAnchor.setAttribute('class', 'copyable-text');
      barcodeArea.setAttribute('class','copyable-background');
      barcodeArea.nextElementSibling.setAttribute('class','copyable-background');
}
copyBarcode();

//--- Copy country lists
const areas = $('.region-list');
let availableCountries;
let unavailableCountries;

function checkAv_Un() {
  if (areas.length === 0) { //happens with apple music, tidal, and beatport
    return {areas: [], availableArea: null, unavailableArea: null}; //return empty object
  }

  let sections = [];
  areas.each(function(_, entry) { //ignore index
    sections.push($(entry).parent().parent().children().first().text());
  });

  let availableArea = null, unavailableArea = null;
  if (sections.length === 2) { //don't know if theres cases where one list appears and the other one doesn't
    availableArea = areas[0];
    unavailableArea = areas[1];
  }

  return {areas, availableArea, unavailableArea};
}

function extract(tags) {
  let regionArray = [];
  tags.each(function(_, region) { //ignore index
    regionArray.push(region.textContent + ' ' + region.title);
  });
  let list = regionArray.join('\n');
  if (regionArray.length > 30) {
    list = (list.trimEnd() + '\n') //add a newline at the end so the regex works with the last country
      .replace(/^(.*)\n(.*)\n(.*)/gm, '$1 | $2 | $3') //split into three columns and add | delimiters
      .replace(/( \| )$|(\n)$/gm, ''); //remove last delimiter or newline
  }
  return list;
}

function getLists() {
  let result = checkAv_Un();
  if (!result.availableArea || !result.unavailableArea) {return;}

  let a_abbrTags = $(result.availableArea).find('abbr');
  let u_abbrTags = $(result.unavailableArea).find('abbr');

  availableCountries = extract(a_abbrTags);
  unavailableCountries = extract(u_abbrTags);
}
getLists(); //run on page load

function placeOnPage() {
  let today = new Date().toISOString().slice(0, 10);
  let checkResult = checkAv_Un();
  if (checkResult.areas.length === 0) {return;}

  let avAreaHeader = $(checkResult.availableArea).parent().parent().children().first()[0];
  let unavAreaHeader = $(checkResult.unavailableArea).parent().parent().children().first()[0];

  avAreaHeader.setAttribute('class','copyable-background');
  unavAreaHeader.setAttribute('class','copyable-background');

  let avAnchor = document.createElement('a');
    avAnchor.textContent = 'Availability';
    avAnchor.setAttribute('class', 'copyable-text');
    avAnchor.title = 'Click to copy';
    avAnchor.addEventListener('click', () => {
      writeClipboardText(`=== Available in the following regions, as of ${today} ===\n${availableCountries}`);
      showCopyNotif();
    });
    avAreaHeader.textContent = '';
    avAreaHeader.appendChild(avAnchor);

  let unavAnchor = document.createElement('a');
    unavAnchor.textContent = 'Unavailability';
    unavAnchor.setAttribute('class', 'copyable-text');
    unavAnchor.title = 'Click to copy';
    unavAnchor.addEventListener('click', () => {
      writeClipboardText(`=== Unavailable in the following regions, as of ${today} ===\n${unavailableCountries}`);
      showCopyNotif();
    });
    unavAreaHeader.textContent = '';
    unavAreaHeader.appendChild(unavAnchor);
}
placeOnPage(); //run on page load

//--- make permalink copyable in one click
function copyPermalink() {
  let permaLink = $('p.center > a')[0];
  let permaLinkURL = permaLink.href;
      permaLink.href = "javascript:void(0);";
      permaLink.addEventListener("click", () => writeClipboardText(permaLinkURL));
}
copyPermalink();

//--- make catalog number copyable in one click
function copyCatNo() {
  if ($('.release-labels')[0].lastChild.lastChild) { //check if there's a catalog number
    let catNoElement = $('.release-labels')[0].lastChild.lastChild;
    let catNo = catNoElement.textContent.trim();
    let catNoAnchor = document.createElement('a');
    catNoAnchor.textContent = catNoElement.textContent.trim();
    catNoAnchor.title = 'Click to copy: '+catNo;
    catNoElement.textContent = '';
    catNoElement.parentElement.append(catNoAnchor);
    catNoAnchor.setAttribute('class','copyable-text');
    catNoAnchor.style.padding = '10px';
    catNoAnchor.style.marginLeft = '1em';
    catNoAnchor.addEventListener('click',() =>{
      writeClipboardText(catNo);
      showCopyNotif();
    });
  }
}
copyCatNo();

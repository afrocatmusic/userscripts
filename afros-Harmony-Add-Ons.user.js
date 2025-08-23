// ==UserScript==
// @name        afro's Harmony Add-Ons
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-Harmony-Add-Ons.user.js
// @match       https://harmony.pulsewidth.org.uk/release?*
// @version     1.3
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//--- add search links for youtube music, qobuz, beatsource, and HDTracks
function addSearchLinks() {
  const separator = document.createTextNode(' | ');

  //deal with VA
  let relArtist = '';
  if ($('.artist-credit')[0].childElementCount < 5) {
        relArtist = $('.release-artist')[0].textContent.slice(3).replaceAll('&','%26').replaceAll('/',' ');
    } else {
        relArtist = 'Various Artists';
    }
  let relTitle = $('.release-title')[0].textContent.replaceAll('&','%26').replaceAll('/',' ');

  //YouTube Music
  let barcode = $('[title="Global Trade Item Number"]')[0].parentElement.nextElementSibling.textContent.replace(/^0+/,''); //remove leading zeroes
  let ytRelURL = `https://music.youtube.com/search?q="${barcode}"`;
  let ytReleaseLink = document.createTextNode('Search YouTube Music');
  let ytRelAnchor = document.createElement('a');
      ytRelAnchor.appendChild(ytReleaseLink);
      ytRelAnchor.setAttribute('href', ytRelURL);

  //Qobuz
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
  let regionKey = regionInput.split(',').map(code => code).find(code => regionMap[code]);
  let qbzRegion = regionMap[regionKey] || defaultQbzRegion;
  let qbzSearchURL = `https://www.qobuz.com/${qbzRegion}/search/albums/${relArtist} ${relTitle}`;
  let linkQbzText = document.createTextNode('Search Qobuz');
  let qbzAnchor = document.createElement('a');
      qbzAnchor.appendChild(linkQbzText);
      qbzAnchor.setAttribute('href', qbzSearchURL);

  //Beatsource
  let btsSearchURL = `https://www.beatsource.com/search/releases?q=${relArtist} ${relTitle}`;
  let linkBtsText = document.createTextNode('Search Beatsource');
  let btsAnchor = document.createElement('a');
      btsAnchor.appendChild(linkBtsText);
      btsAnchor.setAttribute('href', btsSearchURL);

  //HDTracks
  let hdtSearchURL = `https://www.hdtracks.com/#/search?q=${relArtist}%20${relTitle}`;
  let linkHDTText = document.createTextNode('Search HDTracks');
  let hdtAnchor = document.createElement('a');
      hdtAnchor.appendChild(linkHDTText);
      hdtAnchor.setAttribute('href', hdtSearchURL);

  //placing
  let space = $('h2.center')[0];
      space.nextElementSibling.append(qbzAnchor, separator, ytRelAnchor, separator.cloneNode(), btsAnchor, separator.cloneNode(), hdtAnchor);
}
addSearchLinks();

//taken from the actual icon Harmony uses
const copySVG = `
  <svg class="icon" width="18" height="18" stroke-width="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path>
    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"></path>
  </svg>
`;
let copySVGCheck = `
  <svg class="icon" width="18" height="18" stroke-width="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path>
    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"></path>
    <path d="M11 14l2 2l4 -4"></path>
  </svg>
`;

//--- copy permalink
function copyPermalink() {
  const permalinkElem = $('p.center');
  const permalink = permalinkElem.find('a')[0].href;
  let copyButton = $(`<button class="copy" type="button" title="Copy to clipboard" style="margin-left: 0.3em;">${copySVG}</button>`)
    .on('click', async () => {
      writeClipboardText(permalink);
      copyButton.html(copySVGCheck);
      await delay(1000);
      copyButton.html(copySVG);
    })
    .appendTo(permalinkElem);
}
copyPermalink();

//--- copy catalog number
function copyCatNo() {
  let catNoElement = $('.release-labels')[0].lastChild.lastChild;
  let catNo = catNoElement.textContent.trim();
  if (catNo.length > 0) { //check if there's a catalog number
    const area = $('.release-labels > li')[0];
    let copyButton = $(`<button class="copy" type="button" title="Copy to clipboard" style="margin-left: 0.3em;">${copySVG}</button>`)
      .on('click', async () => {
        writeClipboardText(catNo);
        copyButton.html(copySVGCheck);
        await delay(1000);
        copyButton.html(copySVG);
      })
      .appendTo(area);
  }
}
copyCatNo();

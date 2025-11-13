// ==UserScript==
// @name          afro's Beatsource Add-Ons
// @namespace     https://github.com/afrocatmusic/userscripts
// @updateURL     https://raw.github.com/afrocatmusic/userscripts/main/afros-Beatsource-Add-Ons.user.js
// @downloadURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-Beatsource-Add-Ons.user.js
// @match         https://www.beatsource.com/*
// @grant         GM.xmlHttpRequest
// @grant         GM.getValue
// @grant         GM.setValue
// @version       1.1
// @author        afro
// @description   Adds some extra info to beatsource release pages + handy links for importing into MusicBrainz
// @require       https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

function parseDataFromHTML(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  const nextDataElement = tempDiv.querySelector('#__NEXT_DATA__');

  if (!nextDataElement) {
    return null;
  }

  try {
    const rawReleaseInfo = JSON.parse(nextDataElement.textContent || nextDataElement.innerHTML).props.pageProps;

    if (rawReleaseInfo.release && rawReleaseInfo.release.name) {
      const relTitle = rawReleaseInfo.release.name;
      const barcode = rawReleaseInfo.release.upc;
      const catNum = rawReleaseInfo.release.catalog_number;
      const isrcList = rawReleaseInfo.tracks ? rawReleaseInfo.tracks.results.map(track => track.isrc) : [];

      return { barcode, relTitle, catNum, isrcList };
    }
  } catch (e) {
  }
  return null;
}

async function fetchAndGetData() {
  //fetch the new html
  try {
    const url = window.location.href;

    const htmlContent = await new Promise((resolve, reject) => {
      $.get(url, function (data) {
        if (typeof data === 'string') {
          resolve(data);
        } else if (data && data.documentElement) {
          resolve(data.documentElement.outerHTML);
        } else {
          reject(new Error('Failed to retrieve valid HTML content.'));
        }
      }).fail((jqXHR, textStatus, errorThrown) => {
        reject(new Error(`AJAX request failed: ${textStatus} ${errorThrown}`));
      });
    });

    return parseDataFromHTML(htmlContent);

  } catch (error) {
    return null;
  }
}

function addToPage(info) {
  $('#beatsourceAddOnsInfo').remove();

  if (!info) {return;}

  const area = $(sidebarTargetSelector);

  if (area.length === 0) {
    return;
  }

  const isrcParams = info.isrcList.map((isrc, index) => {
    return `isrc${index + 1}=${isrc}`;
  });

  let magicISRCURL = `https://magicisrc.kepstin.ca/?${isrcParams.join('&')}`;

  const rawEditNote = `Import ISRCs from ${window.location.href} using https://github.com/afrocatmusic/userscripts/blob/main/afros-Beatsource-Add-Ons.user.js`;
  const editNote = encodeURIComponent(rawEditNote);
  magicISRCURL = `${magicISRCURL}&edit-note=${editNote}`;

  const injectedDiv = $(`
    <div id="beatsourceAddOnsInfo">
      <p>Title: ${info.relTitle}</p>
      <p>Barcode: <a href="https://harmony.pulsewidth.org.uk/release?category=preferred&gtin=${info.barcode}">${info.barcode}</a></p>
      <p class="addonCatNo">Catalog Number: ${info.catNum}</p>
      <a href="${magicISRCURL}">Submit ISRCs to MusicBrainz</a>
    </div>
  `).css({
    'font-size': '1.5rem',
    'color': '#415974',
    'line-height': '2.5rem',
    'padding-bottom': '1.5rem',
    'margin-top': '1.5rem',
  });

  area.append(injectedDiv);

  if (info.barcode === info.catNum) {
    injectedDiv.find('.addonCatNo').remove();
  }
}

function showLoadingState() {
  $('#beatsourceAddOnsInfo').remove();

  const area = $(sidebarTargetSelector);
  if (area.length === 0) {
    return;
  }

  const loadingDiv = $(`
    <div id="beatsourceAddOnsInfo">
      <p>Loading release data...</p>
    </div>
  `).css({
    'font-size': '1.5rem',
    'color': '#415974',
    'line-height': '2.5rem',
    'padding-bottom': '1.5rem',
    'margin-top': '1.5rem',
  });

  area.append(loadingDiv);
}

let lastKnownRelTitle = null;

async function processPageUpdate() {

  if (window._bs_addon_processing) {return;}
  window._bs_addon_processing = true;

  const info = await fetchAndGetData();

  window._bs_addon_processing = false;

  if (!info || !info.relTitle) {return;}

  if (info.relTitle === lastKnownRelTitle) {return;}

  showLoadingState();
  await new Promise(resolve => setTimeout(resolve, 300));

  addToPage(info);
  lastKnownRelTitle = info.relTitle;
}

const originalPushState = history.pushState;
const observerTargetSelector = '#__next';
const sidebarTargetSelector = '[data-testid="col-sidebar"]';

function setupObservers() {
  const targetNode = $(observerTargetSelector)[0];
  const config = { childList: true, subtree: true, characterData: true };

  const callback = function (mutationsList, observer) {
    clearTimeout(window._bs_addon_timer);
    window._bs_addon_timer = setTimeout(processPageUpdate, 200);
  };

  const observer = new MutationObserver(callback);

  if (targetNode) {
    observer.observe(targetNode, config);
  } else {
    console.error("Could not find main container to observe.");
  }

  //overwrite pushState
  history.pushState = function () {
    const go = originalPushState.apply(this, arguments);
    $('#beatsourceAddOnsInfo').remove();
    lastKnownRelTitle = null;
    setTimeout(processPageUpdate, 50);
    return go;
  };
}

async function run() {
  const initialData = await fetchAndGetData();
  if (initialData) {
    lastKnownRelTitle = initialData.relTitle;
    addToPage(initialData);
  }

  setupObservers();
}
run();

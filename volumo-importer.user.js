// ==UserScript==
// @name        Volumo importer
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/volumo-importer.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/volumo-importer.user.js
// @match       https://volumo.com/*
// @grant       none
// @version     2026.06.08.12
// @author      afro
// @icon        https://volumo.com/static/favicon/favicon.svg
// @description Import Volumo releases to MusicBrainz
// ==/UserScript==

// https://www.freecodecamp.org/news/javascript-debounce-example/
function debounce(func, timeout = 500){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function getReleaseID() {
  const id = location.pathname.match(/\/album\/(\d+)-/);
  return id ? id[1] : null;
}

function css() {
  if (document.getElementById('importer-script-styles')) return;
  const styleText = `
    .script-buttons {
      border: none;
      color: #f6f6f6;
      cursor: pointer;
      padding: 10px;
      transition: 0.2s;
      align-items: center;
      justify-content: center;
      text-align: center;
      display: flex;
      column-gap: 5px;
    }
    .script-buttons:hover {
      filter: brightness(1.1);
    }
    .script-buttons > img {
      transition: 0.2s;
    }
    .script-buttons:hover > img {
      scale: 1.1;
    }
    .import-button {
      background-color: #8C27AF;
    }
    .harmony-button {
      background-color: #B84949;
    }
  `;
  const style = document.createElement('style');
  style.setAttribute('id', 'importer-script-styles');
  style.innerHTML = styleText;
  document.querySelector('head').append(style);
}

async function addToUI() {
  if (!location.pathname.startsWith('/album/')) return;

  const id = getReleaseID();
  if (!id) return;

  if (document.getElementById('mb-import-button')) return;

  const area = document.querySelector('div[class*="AlbumBlockDesktop_actionLine"]')?.lastChild?.firstChild;
  if (!area) {
    window.setTimeout(addToUI, 250);
    return;
  }

  css();

  const importButton = document.createElement('button');
  importButton.setAttribute('id', 'mb-import-button');
  importButton.className = 'script-buttons import-button';

  const mbLogo = new Image(16, 16);
  mbLogo.src = 'https://musicbrainz.org/static/images/favicons/favicon-32x32.png';
  importButton.append(mbLogo, 'Import to Musicbrainz');

  importButton.addEventListener('click', debounce(async () => {
    const releaseData = await collectData();
    if (releaseData) createForm(releaseData);
  }));

  const isrcButton = document.createElement('button');
  isrcButton.setAttribute('id', 'mb-isrc-button');
  isrcButton.className = 'script-buttons isrc-button';

  const isrcLogo = new Image(16, 16);
  isrcLogo.src = 'https://magicisrc.kepstin.ca/favicon.svg';
  isrcButton.append(isrcLogo, 'Import ISRCs');

  isrcButton.addEventListener('click', debounce(async () => {
    const releaseData = await collectData();
    if (releaseData) importISRCs(releaseData);
  }));

  area.append(importButton, isrcButton);

  let barcode = null;
  if (id.length >= 12) {
    barcode = id;
  }
  else {
    const data = await collectData();
    if (data && data.icpn) barcode = data.icpn;
  }

  if (barcode) {
    if (document.getElementById('mb-harmony-button')) return;

    const harmonyButton = document.createElement('button');
    harmonyButton.setAttribute('id', 'mb-harmony-button');
    harmonyButton.className = 'script-buttons harmony-button';

    const harmonyLogo = new Image(16, 16);
    harmonyLogo.src = 'https://harmony.pulsewidth.org.uk/harmony-logo.svg';
    harmonyButton.append(harmonyLogo, 'Lookup with Harmony');

    const targetBarcode = barcode;
    harmonyButton.addEventListener('click', () => {
      window.open(`https://harmony.pulsewidth.org.uk/release?gtin=${targetBarcode}&category=preferred`, '_blank');
    });

    importButton.after(harmonyButton);
  }
}

async function collectData() {
  const id = getReleaseID();

  // url has the icpn or a generic id
  // switch the base url based on the length of the extracted id
  let baseURL = id.length < 12
  ? 'https://volumo.com/api/v1/albums/'
  : 'https://volumo.com/api/v1/album_by_icpn/';

  const url = baseURL + id;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
    }

    let result = await response.json();
    if (Array.isArray(result)) result = result[0];

    // console.log(result);
    return result;
  }
  catch (error) {
    console.log(error.message);
    return null;
  }
}

function importISRCs(data) {
  let isrcs = [];
  data.tracks.forEach((track) => isrcs.push(track.isrc));

  let url = 'https://magicisrc.kepstin.ca/?';
  for (let i = 0; i < isrcs.length; i++) {
    url += `isrc${i + 1}=${isrcs[i]}&`;
  }
  url += `edit-note=Import+ISRCs+from+${encodeURIComponent(location.href)}+using+${encodeURIComponent(GM_info.script.downloadURL)}`;

  window.open(url, '_blank');
}

function addInput(form, name, val) {
  if (val === null || typeof val === 'undefined' || val === '') return;
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = val;
  form.appendChild(input);
}

function createForm(releaseData) {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = 'https://musicbrainz.org/release/add?skip_confirmation=1';
  form.target = '_blank';
  form.style.display = 'none';

  // api response examples
  // https://volumo.com/api/v1/album_by_icpn/5054285993217
  // https://volumo.com/api/v1/albums/1659997

  addInput(form, 'name', releaseData.title);

  if (releaseData.artists.some(artist => artist.name === 'Various Artists') || releaseData.artists.length > 4) {
    addInput(form, 'artist_credit.names.0.artist.name', 'Various Artists');
    addInput(form, 'artist_credit.names.0.name', 'Various Artists');
    addInput(form, 'artist_credit.names.0.mbid', '89ad4ac3-39f7-470e-963a-56509c546377');
  }
  else {
    releaseData.artists.forEach((artist, index) => {
      addInput(form, `artist_credit.names.${index}.artist.name`, artist.name);
      addInput(form, `artist_credit.names.${index}.name`, artist.name);

      let releaseJoinPhrase = '';
      if (index === releaseData.artists.length - 1) releaseJoinPhrase = '';
      else if (index === releaseData.artists.length - 2) releaseJoinPhrase = ' & ';
      else releaseJoinPhrase = ', ';

      if (releaseJoinPhrase) {
        addInput(form, `artist_credit.names.${index}.join_phrase`, releaseJoinPhrase);
      }
    });
  }

  let releaseType = '';
  if (releaseData.tracks.length >= 1 && releaseData.tracks.length <= 3) releaseType = 'single';
  if (releaseData.tracks.length >= 4 && releaseData.tracks.length <= 6 || releaseData.title.endsWith(' EP')) releaseType = 'EP';
  if (releaseData.tracks.length >= 7 || releaseData.title.endsWith(' LP')) releaseType = 'album';

  addInput(form, 'type', releaseType);

  addInput(form, 'script', 'Latn');
  addInput(form, 'packaging', 'None');
  addInput(form, 'country', 'XW');
  addInput(form, 'status', 'Official');

  const pub = new Date(releaseData.published_at);
  addInput(form, 'date.year', pub.getUTCFullYear());
  addInput(form, 'date.month', pub.getUTCMonth() + 1);
  addInput(form, 'date.day', pub.getUTCDate());

  let annotation = '';
  if (releaseData.original_release_date) {
    annotation += `Original release date: ${releaseData.original_release_date}`;
  }
  if (annotation) {
    addInput(form, 'annotation', annotation);
  }

  addInput(form, `labels.0.name`, releaseData.recordlabel.name);
  addInput(form, `labels.0.catalog_number`, releaseData.catalog_number);

  if (!releaseData.icpn) addInput(form, 'barcode', 'none');
  else addInput(form, 'barcode', releaseData.icpn);

  // tracklist
  // dont know if releases can have multiple mediums
  addInput(form, 'mediums.0.format', 'Digital Media');

  releaseData.tracks.forEach((track, index) => {
    addInput(form, `mediums.0.track.${index}.number`, index + 1);

    if (!track.version || track.version === 'Original Mix') {
      addInput(form, `mediums.0.track.${index}.name`, track.title);
    }
    else {
      addInput(form, `mediums.0.track.${index}.name`, `${track.title} (${track.version})`);
    }

    addInput(form, `mediums.0.track.${index}.length`, Math.floor(track.duration));

    const mainArtists = track.artists || [];
    const featArtists = track.featured_artists || [];
    const allTrackArtists = [...mainArtists, ...featArtists];

    allTrackArtists.forEach((artist, artistIndex) => {
      addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.artist.name`, artist.name);
      addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.name`, artist.name);

      let trackJoinPhrase = '';
      const isFeatured = artistIndex >= mainArtists.length;

      if (artistIndex === allTrackArtists.length - 1) trackJoinPhrase = '';

      else if (artistIndex === mainArtists.length - 1 && featArtists.length > 0) {
        trackJoinPhrase = ' feat. ';
      }

      else if (
        (!isFeatured && artistIndex === mainArtists.length - 2) ||
        (isFeatured && artistIndex === allTrackArtists.length - 2)
      ) trackJoinPhrase = ' & ';

      else trackJoinPhrase = ', ';

      if (trackJoinPhrase) {
        addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.join_phrase`, trackJoinPhrase);
      }
    });
  });

  const releaseURL = window.location.href;
  addInput(form, 'urls.0.url', releaseURL);
  addInput(form, 'urls.0.link_type', 74); // purchase for download
  addInput(form, 'urls.1.url', releaseURL);
  addInput(form, 'urls.1.link_type', 980); // streaming page

  addInput(form, 'edit_note', `Imported from ${releaseURL} using ${GM_info.script.downloadURL}`);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function setupObserver() {
  let timer;

  const observer = new MutationObserver((mutationList) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      addToUI();
    }, 500);
  });

  const targetNode = document.querySelector('div#__next');
  const config = {childList: true, subtree: true};
  observer.observe(targetNode, config);

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', addToUI);
  }
  else addToUI();
}
setupObserver();

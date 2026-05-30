// ==UserScript==
// @name        Amazon Music importer
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/amazon-music-importer.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/amazon-music-importer.user.js
// @match       https://music.amazon.tld/*
// @grant       none
// @version     2026.05.30.5
// @author      afro
// @icon        https://m.media-amazon.com/images/G/01/music/logo/1.0/smile_256x256.png
// @description Import Amazon Music releases to MusicBrainz
// @require     https://code.jquery.com/jquery-4.0.0.min.js
// ==/UserScript==

function addToUI() {
  // only on releases
  if (!location.href.includes('/albums/')) return;

  const targetArea = $('music-detail-header div[slot="icons"]');
  if (!targetArea.length) return;

  // prevent duplicates
  const importerClass = $('.musicbrainz-import-button');
  if (importerClass) importerClass.remove();
  const importerId = $('#musicbrainz-importer');
  if (importerId) importerId.remove();

  $('head').append(`
    <style id="musicbrainz-importer">
      .musicbrainz-import-button {
        background-color: #8C27AF;
        border: none;
        border-radius: 5px;
        color: #f6f6f6;
        cursor: pointer;
        font-weight: bold;
        padding: 10px;
      }
      .musicbrainz-import-button:hover {
        background-color: #a73bcc;
        scale: 1.01;
      }
    </style>
  `);

  const button = $(`<button class="musicbrainz-import-button">Import to MusicBrainz</button>`)
    .appendTo(targetArea)
    .on('click', function() {
      const data = collectData();
      createForm(data);
    });
}

function splitArtists(string) {
  const joinPhraseRegex = /(, | & | feat\. | featuring | ft\. )/g;
  const artistArray = string.replace(joinPhraseRegex, '\n').split('\n');
  const joinPhrases = string.match(joinPhraseRegex) || '';

  return { artistArray, joinPhrases };
}

function collectData() {
  // parse ISO 8601 durations to seconds
  function isoDurationToSeconds(duration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);

    if (!matches) return 0;

    const hours = parseInt(matches[1] || 0, 10);
    const minutes = parseInt(matches[2] || 0, 10);
    const seconds = parseInt(matches[3] || 0, 10);

    return (hours * 3600) + (minutes * 60) + seconds;
  }

  let tracklist = [];
  let releaseURL = '';
  let releaseDate = []; // yyyy,mm,dd
  let relArtists = [];
  let relJoinPhrases = [];
  let releaseTitle = '';

  const scriptElem = document.querySelector('script[type="application/ld+json"][data-react-helmet="true"]');
  if (scriptElem) {
    const json = JSON.parse(scriptElem.innerHTML);

    const relArtistssAndPhrases = splitArtists(json.byArtist.name);
    relArtists = relArtistssAndPhrases.artistArray;
    relJoinPhrases = relArtistssAndPhrases.joinPhrases;

    releaseTitle = json.name;
    releaseURL = json.url;
    const jsDate = new Date(json.datePublished);
    releaseDate = [jsDate.getUTCFullYear(), jsDate.getUTCMonth() + 1, jsDate.getUTCDate()];

    for (let track of json.track) {
      tracklist.push({
        number: track.position,
        title: track.name,
        duration: isoDurationToSeconds(track.duration)
      });
    }
  }

  const copyrightLine = document.querySelector('div#main_content div span.music-tertiary-text')?.textContent;

  let trackArtists = [];
  let trackJoinPhrases = [];
  const trackRows = document.querySelectorAll('music-text-row');
  for (let row of trackRows) {
    const rawartistText = row.querySelector('music-link[kind="secondary"]:has(a[href^="/artists"])')?.textContent;
    if (rawartistText) {
      const artistsAndPhrases = splitArtists(rawartistText);
      trackArtists.push(artistsAndPhrases.artistArray);
      trackJoinPhrases.push(artistsAndPhrases.joinPhrases);
    }
    else {
      trackArtists.push([]);
      trackJoinPhrases.push([]);
    }
  }

  const num = trackRows.length;
  let releaseType = 'single'; // default
  if (num >= 1 && num <= 3) {
    releaseType = 'single';
  }
  if (num >= 4 && num <= 6 || releaseTitle.endsWith(' EP')) {
    releaseType = 'EP';
  }
  if (num >= 7) {
    releaseType = 'album';
  }

  let data = {
    relArtists,
    relJoinPhrases,
    releaseTitle,
    releaseType,
    trackArtists,
    trackJoinPhrases,
    tracklist,
    releaseURL,
    releaseDate,
    copyrightLine
  };

  // console.log(data);
  return data;
}

function addInput(form, name, val) {
  if (val === null || typeof val === 'undefined' || val === '') return;
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = val;
  form.appendChild(input);
}

function createForm(data) {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = 'https://musicbrainz.org/release/add?skip_confirmation=1';
  form.target = '_blank';
  form.style.display = 'none';

  addInput(form, 'name', data.releaseTitle);

  const relArtists = data.relArtists;
  const relPhrases = data.relJoinPhrases || [];

  if (relArtists && relArtists.length > 0) {
    relArtists.forEach((artistName, index) => {

      addInput(form, `artist_credit.names.${index}.artist.name`, artistName);
      addInput(form, `artist_credit.names.${index}.name`, artistName);

      if (index < relArtists.length - 1 && relPhrases[index]) {
        addInput(form, `artist_credit.names.${index}.join_phrase`, relPhrases[index]);
      }
    });
  } else {
    addInput(form, 'artist_credit.names.0.artist.name', 'Various Artists');
    addInput(form, 'artist_credit.names.0.name', 'Various Artists');
  }

  addInput(form, 'type', data.releaseType);
  addInput(form, 'script', 'Latn');
  addInput(form, 'packaging', 'None');
  addInput(form, 'country', 'XW');
  addInput(form, 'status', 'Official');

  const launchDate = [2007, 9, 25];
  let annotationParts = [];

  if (data.releaseDate && data.releaseDate.length === 3) {
    const releaseDateTime = Date.UTC(data.releaseDate[0], data.releaseDate[1] - 1, data.releaseDate[2]);
    const launchDateTime = Date.UTC(launchDate[0], launchDate[1] - 1, launchDate[2]);

    if (releaseDateTime < launchDateTime) {
      const formattedDate = `${data.releaseDate[0]}-${String(data.releaseDate[1]).padStart(2, '0')}-${String(data.releaseDate[2]).padStart(2, '0')}`;
      annotationParts.push(`Amazon Music shows the date as ${formattedDate}, but the platform itself did not exist until September, 2007`);
    } else {
      addInput(form, 'date.year', data.releaseDate[0]);
      addInput(form, 'date.month', data.releaseDate[1]);
      addInput(form, 'date.day', data.releaseDate[2]);
    }
  }

  if (data.copyrightLine) {
    annotationParts.push(data.copyrightLine);
  }

  if (annotationParts.length) {
    addInput(form, 'annotation', annotationParts.join('\n\n'))
  }

  addInput(form, 'urls.0.link_type', 980); // streaming page
  addInput(form, 'urls.0.url', data.releaseURL);

  let editNote = `Imported from ${data.releaseURL} using https://github.com/afrocatmusic/userscripts/blob/main/amazon-music-importer.user.js`;
  addInput(form, 'edit_note', editNote);

  addInput(form, 'mediums.0.format', 'Digital Media');

  data.tracklist.forEach((track, index) => {
    addInput(form, `mediums.0.track.${index}.number`, track.number);
    addInput(form, `mediums.0.track.${index}.name`, track.title);
    addInput(form, `mediums.0.track.${index}.length`, track.duration * 1000);

    const tArtists = data.trackArtists[index] || [];
    const tPhrases = data.trackJoinPhrases[index] || [];

    if (tArtists.length > 0) {
      tArtists.forEach((artistName, artistIndex) => {

        addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.artist.name`, artistName);
        addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.name`, artistName);

        if (artistIndex < tArtists.length - 1 && tPhrases[artistIndex]) {
          addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.join_phrase`, tPhrases[artistIndex]);
        }
      });
    }
    else {
      relArtists.forEach((artistName, artistIndex) => {
        addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.artist.name`, artistName);
        addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.name`, artistName);

        if (artistIndex < relArtists.length - 1 && relPhrases[artistIndex]) {
          addInput(form, `mediums.0.track.${index}.artist_credit.names.${artistIndex}.join_phrase`, relPhrases[artistIndex]);
        }
      });
    }
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function setupObserver() {
  const targetNode = document.querySelector('head title');

  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length > 0) {
        addToUI();
      }
    }
  });

  const config = {childList: true, subtree: true};
  observer.observe(targetNode, config);
  addToUI();
}

const check = setInterval(() => {
  if (document.querySelector('head title')) {
    clearInterval(check);
    addToUI();
    setupObserver();
  }
}, 200);

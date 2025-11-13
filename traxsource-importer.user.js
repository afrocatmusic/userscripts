// ==UserScript==
// @name         Traxsource MusicBrainz Importer
// @namespace    https://github.com/afrocatmusic/userscripts
// @updateURL    https://raw.github.com/afrocatmusic/userscripts/main/traxsource-importer.user.js
// @downloadURL  https://raw.github.com/afrocatmusic/userscripts/main/traxsource-importer.user.js
// @match        https://www.traxsource.com/*
// @grant        none
// @version      2025.11.13.2
// @author       afro
// @description  Import Traxsource releases to MusicBrainz
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

const $jq = jQuery.noConflict(true);

let currentHeadTitle = '';
let submitBtn = null;

function getReleaseInfo() {
  const relTitle = $jq('h1.title').text();
  const relArtists = $jq('h1.artists').text().trim().split(/,\s*/).filter(a => a.length > 0);

  const label = $jq('.page-head .com-label').text();

  const catDateElem = $jq('.cat-rdate').text().split('|').map(s => s.trim());
  let catNo = catDateElem[0];
  let relDate = catDateElem[1];

  const sourceUrl = window.location.href;

  let upc = '';
  const relDescription = $jq('.desc.com-exp-cont').text();
  const upcRegex = /\b\d{8,14}\b/g;
  const upcMatch = relDescription.match(upcRegex);

  if (upcMatch && upcMatch.length > 0) {
    upc = upcMatch[0];
  }

  //test if the catalog number is the UPC
  if (!upc && upcRegex.test(catNo)) {
    upc = catNo;
    // could remove the catNo if it really is the UPC
    // catNo = '';
  }

  return { relTitle, relArtists, label, catNo, relDate, sourceUrl, upc };
}

function getTracklist() {
  let tracks = [];
  const trackRows = $jq('.trklist > .trk-row');

  trackRows.each((idx, tr) => {
    const $tr = $jq(tr);

    const trackNumber = idx + 1;
    const trackTitle = $tr.find('.trk-cell.title a').text();
    const $versionSpan = $tr.find('.trk-cell.title span.version');
    const $durationSpan = $versionSpan.find('span.duration');

    let trackLengthMs = null;
    let trackVersion = '';

    //get the text node only, not the duration span child
    const versionTextNode = $versionSpan.contents().filter(function () {
      return this.nodeType === 3;
    }).get(0);

    if (versionTextNode) {
      trackVersion = versionTextNode.nodeValue.trim();
    }

    if ($durationSpan.length) {
      const trackLengthStr = $durationSpan.text().replace(/[()]/g, '').trim();

      if (trackLengthStr) {
        const timeParts = trackLengthStr.split(':').map(p => parseInt(p, 10));
        if (timeParts.every(p => !isNaN(p))) {
          if (timeParts.length === 2) {
            trackLengthMs = (timeParts[0] * 60 + timeParts[1]) * 1000;
          } else if (timeParts.length === 3) {
            trackLengthMs = (timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]) * 1000;
          }
        }
      }
    }
    trackVersion = trackVersion.replaceAll('Original Mix', '');

    let trackArtists = [];
    let trackArtistElems = $tr.find('.trk-cell.artists a.com-artists');
    trackArtistElems.each(function () {
      trackArtists.push($jq(this).text())
    });

    if (trackTitle) {
      const finalTitle = trackVersion ? `${trackTitle} (${trackVersion})` : trackTitle;

      tracks.push({
        number: trackNumber,
        title: finalTitle,
        duration: trackLengthMs,
        artist_credit: trackArtists
      });
    }
  });

  return tracks;
}

function guessReleaseType(releaseInfo, tracklist) {
  //guess release type based on some completely arbitrary rules
  //1-3 tracks = single
  //4-6 tracks (or title ending in "EP") = EP
  //7 or more = album
  const trackCount = tracklist.length;
  const title = releaseInfo.relTitle;

  if (trackCount >= 1 && trackCount <= 3) {
    return 'single';
  }
  if (trackCount >= 4 && trackCount <= 6 || title.endsWith(' EP')) {
    return 'EP';
  }
  if (trackCount >= 7) {
    return 'album';
  }
  //fallback to single if trackCount is somehow 0
  return 'single';
}

function addInput(form, name, value) {
  if (value === null || typeof value === 'undefined' || value === '') return;
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  form.appendChild(input);
}

function createForm(releaseInfo, tracklist) {
  cleanupButtonAndForm();

  const form = document.createElement('form');
  form.method = 'post';
  form.action = 'https://musicbrainz.org/release/add';
  form.target = '_blank';
  form.style.display = 'none';

  const guessedType = guessReleaseType(releaseInfo, tracklist);

  submitBtn = $jq(`<button>`)
    .text('Import to MusicBrainz')
    .attr('type', 'submit')
    .css({
      'padding': '10px',
      'background-color': '#8C27AF',
      'color': '#f6f6f6',
      'border': 'none',
      'cursor': 'pointer',
      'font-weight': 'bold',
      'border-radius': '5px',
      'margin-top': '10px'
    });

  const mbLogo = $jq(`
    <img
      src="https://raw.githubusercontent.com/metabrainz/design-system/master/brand/logos/MusicBrainz/SVG/MusicBrainz_logo_icon.svg"
      width="16px"
      height="16px"
    >`)
    .css({
      'vertical-align': 'middle',
      'margin-right': '5px',
    });

  submitBtn.prepend(mbLogo);

  submitBtn.on('click', function () {
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  });

  $jq('div.ttl-block div.t-info').append(submitBtn);

  addInput(form, 'name', releaseInfo.relTitle);

  const artists = releaseInfo.relArtists;

  if (artists.length > 4) {
    addInput(form, 'artist_credit.names.0.artist.name', 'Various Artists');
    addInput(form, 'artist_credit.names.0.name', 'Various Artists');
  } else if (artists.length > 0) {
    artists.forEach((artistName, index) => {
      const prefix = `artist_credit.names.${index}`;

      addInput(form, `${prefix}.artist.name`, artistName);
      addInput(form, `${prefix}.name`, artistName);

      if (index < artists.length - 1) {
        if (artists.length === 2) {
          addInput(form, `${prefix}.join_phrase`, ' & ');
        }
        else if (artists.length > 2) {
          const joinPhrase = (index === artists.length - 2) ? ' & ' : ', ';
          addInput(form, `${prefix}.join_phrase`, joinPhrase);
        }
      }
    });
  } else {
    addInput(form, 'artist_credit.names.0.artist.name', 'Various Artists');
    addInput(form, 'artist_credit.names.0.name', 'Various Artists');
  }

  addInput(form, 'labels.0.name', releaseInfo.label);
  addInput(form, 'labels.0.catalog_number', releaseInfo.catNo);
  addInput(form, 'type', guessedType);
  addInput(form, 'language', 'eng');
  addInput(form, 'script', 'Latn');
  addInput(form, 'packaging', 'None');
  addInput(form, 'country', 'XW');
  addInput(form, 'status', 'Official');

  //traxsource was launched in october 2004 - https://hse.fm/blogs/players/traxsource-live
  const cutoffDateString = '2004-10-01';
  let annotation = '';

  if (releaseInfo.relDate) {
    const dateParts = releaseInfo.relDate.split('-');

    if (dateParts.length === 3) {
      if (releaseInfo.relDate >= cutoffDateString) {
        addInput(form, 'date.year', dateParts[0]);
        addInput(form, 'date.month', dateParts[1]);
        addInput(form, 'date.day', dateParts[2]);
      } else {
        annotation = `Traxsource shows the release date as ${releaseInfo.relDate}, but Traxsource itself did not exist until October, 2004.`;
      }
    }
  }

  //type 74 = purchase for download
  addInput(form, 'urls.0.link_type', 74);
  addInput(form, 'urls.0.url', releaseInfo.sourceUrl);

  if (releaseInfo.upc) {
    addInput(form, 'barcode', releaseInfo.upc);
  }

  addInput(form, 'edit_note', `Imported from ${releaseInfo.sourceUrl}`);

  if (annotation) {
    addInput(form, 'annotation', annotation);
  }

  addInput(form, 'mediums.0.format', 'Digital Media');

  tracklist.forEach((track, index) => {
    const prefix = `mediums.0.track.${index}`;

    addInput(form, `${prefix}.number`, track.number);
    addInput(form, `${prefix}.name`, track.title);
    addInput(form, `${prefix}.length`, track.duration);

    const trackArtists = track.artist_credit;
    trackArtists.forEach((artistName, artistIndex) => {
      addInput(form, `${prefix}.artist_credit.names.${artistIndex}.artist.name`, artistName);

      if (artistIndex < trackArtists.length - 1) {
        if (trackArtists.length === 2) {
          addInput(form, `${prefix}.artist_credit.names.${artistIndex}.join_phrase`, ' & ');
        }
        else if (trackArtists.length > 2) {
          const joinPhrase = (artistIndex === trackArtists.length - 2) ? ' & ' : ', ';
          addInput(form, `${prefix}.artist_credit.names.${artistIndex}.join_phrase`, joinPhrase);
        }
      }
    });
  });
}

function cleanupButtonAndForm() {
  if (submitBtn) {
    submitBtn.remove();
    submitBtn = null;
  }
  $jq('form[action="https://musicbrainz.org/release/add"]').remove();
}

function initializeImporter() {
  //only run on releases
  if (!window.location.href.includes('https://www.traxsource.com/title/')) {
    cleanupButtonAndForm();
    return;
  }

  if ($jq('.t-info').length === 0) {
    cleanupButtonAndForm();
    return;
  }

  const releaseInfo = getReleaseInfo();
  const tracklist = getTracklist();

  if (releaseInfo.relTitle && tracklist.length > 0) {
    createForm(releaseInfo, tracklist);
  } else {
    cleanupButtonAndForm();
  }
}

$jq(document).ready(function () {
  currentHeadTitle = $jq('title').text();
  initializeImporter();

  const titleObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.target.nodeName === 'TITLE') {
        const newTitle = $jq('head > title').text();

        if (newTitle !== currentHeadTitle) {
          currentHeadTitle = newTitle;

          setTimeout(initializeImporter, 500);
        }
      }
    });
  });

  const titleElement = document.querySelector('head > title');
  if (titleElement) {
    titleObserver.observe(titleElement, {
      subtree: true,
      childList: true
    });
  }
});

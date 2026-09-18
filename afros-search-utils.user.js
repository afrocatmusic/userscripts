// ==UserScript==
// @name        afro's search utilities
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-search-utils.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-search-utils.user.js
// @include     /^http[^:]*?://[^/]*?musicbrainz\.[^/]*?/.*?$/
// @exclude     /\/release\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/(discids|cover-art|aliases|tags|details|edit|edit-relationships|delete|change-quality|edits|open_edits)/
// @exclude     /\/release\/add/
// @version     2026.9.18.1
// @author      afro
// @grant       none
// @description Add external search options to release and release group pages
// ==/UserScript==

function css() {
  $('head').append(`<style>
  .search-icon-button {
    cursor: pointer;
    background: none;
    border: none;
  }
  .search-icon-shadow {
    filter: drop-shadow(0 0 1px white);
  }
  .search-icon-button > img {
    border-radius: 5px;
  }
  .search-container-div {
    max-width: 16em;
  }
  .search-container-div > h3:hover {
    user-select: none;
    cursor: pointer;
  }
  .search-buttons-div {
    max-height: 0px;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    margin-top: 1em;
  }
  .search-buttons-div-visible {

  }
  </style>`);
}
css();

const barcodeField = $('.barcode');

const type = location.pathname.split('/').filter((n) => n)[0];

function getInfo(request) {
  let title, artist, area, barcode, script, data;
  if (type === 'release') {
    script = Array.from(document.querySelectorAll('script[type="application/json"]'))
      .filter((s) => s.innerHTML.includes('initialCreditsMode'))[0].innerHTML;
    data = JSON.parse(script).release;
    title = data.name;
    artist = data.artist;
    barcode = data.barcode;
    area = $('div.tracklist-and-credits');
  }
  else if (type === 'release-group') {
    if (window.MB && typeof window.MB.getSourceEntityInstance === 'function') {
      const entity = window.MB.getSourceEntityInstance();
      if (entity) {
        title = entity.name;
        artist = entity.artist;
      }
    }

    if (!title && document.querySelector('script[type="application/ld+json"]')) {
      script = document.querySelector('script[type="application/ld+json"]').innerHTML;
      data = JSON.parse(script);
      title = data.name;
      artist = data.creditedTo;
    }

    area = $('#content');
  }

  if (request === 'artist') return artist;
  else if (request === 'title') return title;
  else if (request === 'area') return area;
  else if (request === 'barcode') return barcode;
}

function createButton(name, icon, searchURL, shadow = false) {
  return $(`<a class="search-icon-button${shadow ? ' search-icon-shadow' : ''}" href="${searchURL}" target="_blank" title="Search this release on ${name}">
    <img src="${icon}" width="20px" height="20px">
  </a>`);
}

function animateDiv() {
  const buttonsDiv = $('#search-buttons-div');
  const isVisible = buttonsDiv.hasClass('search-buttons-div-visible');
  if (isVisible) {
    buttonsDiv.removeClass('search-buttons-div-visible');
    buttonsDiv.animate({ 'max-height': '0px' }, 250);
    $(this).text('Search options ▾');
  } else {
    //quick 'none' to read scrollHeight
    buttonsDiv.css('max-height', 'none');
    const scrollHeight = buttonsDiv[0].scrollHeight;
    buttonsDiv.css('max-height', '0px');

    buttonsDiv.animate({'max-height': scrollHeight + 'px'}, 250);
    buttonsDiv.addClass('search-buttons-div-visible');
    $(this).text('Search options ▴');
  }
}

function appendToReleasePage() {
  if ($('.format:contains("Digital Media")').length) { //only on digital releases
    const encodedSearch = `${encodeURIComponent(getInfo('artist'))}%20${encodeURIComponent(getInfo('title'))}`;
    const releaseProviders = [
      {
        name: 'Spotify',
        icon: '/static/images/external-favicons/spotify-32.png',
        url: `https://open.spotify.com/search/${encodedSearch}/albums`
      },
      {
        name: 'Spotify (by barcode)',
        icon: '/static/images/external-favicons/spotify-32.png',
        url: `https://open.spotify.com/search/upc:${getInfo('barcode')}/albums`
      },
      {
        name: 'Deezer',
        icon: '/static/images/external-favicons/deezer-32.png',
        url: `https://www.deezer.com/search/${encodedSearch}/album`
      },
      {
        name: 'Apple Music',
        icon: '/static/images/external-favicons/applemusic-32.png',
        url: `https://music.apple.com/us/search?term=${encodedSearch}`
      },
      {
        name: 'Beatport',
        icon: '/static/images/external-favicons/beatport-32.png',
        url: `https://www.beatport.com/search/releases?q=${encodedSearch}&per_page=5`
      },
      {
        name: 'YouTube Music',
        icon: '/static/images/external-favicons/youtubemusic-32.png',
        url: `https://music.youtube.com/search?q=${encodedSearch}`
      },
      {
        name: 'YouTube Music (by barcode)',
        icon: '/static/images/external-favicons/youtubemusic-32.png',
        url: `https://music.youtube.com/search?q=${getInfo('barcode')}`
      },
      {
        name: 'Qobuz',
        icon: '/static/images/external-favicons/qobuz-32.png',
        url: `https://www.qobuz.com/us-en/search/albums/${encodedSearch.replace(/%2F/g, ' ')}`
      },
      {
        name: 'Volumo',
        icon: 'https://volumo.com/static/favicon/favicon.svg',
        url: `https://volumo.com/releases?search=${encodedSearch}`
      },
      {
        name: 'Volumo (by barcode)',
        icon: 'https://volumo.com/static/favicon/favicon.svg',
        url: `https://volumo.com/album/${getInfo('barcode')}`
      },
      {
        name: 'Subvert',
        icon: 'https://www.subvert.fm/images/favicon.png',
        url: `https://www.subvert.fm/discover?q=${encodedSearch}&type=release`,
        shadow: true
      },
      {
        name: 'HDTracks',
        icon: 'https://www.hdtracks.com/favicon.ico',
        url: `https://www.hdtracks.com/#/search?q=${encodedSearch}`
      },
      {
        name: 'HDTracks (by barcode)',
        icon: 'https://www.hdtracks.com/favicon.ico',
        url: `https://www.hdtracks.com/#/search?q=${getInfo('barcode')}`
      },
      {
        name: 'SoundCloud',
        icon: '/static/images/external-favicons/soundcloud-32.png',
        url: `https://soundcloud.com/search?q=${encodedSearch}`
      },
      {
        name: 'Traxsource',
        icon: '/static/images/external-favicons/traxsource-16.png',
        url: `https://www.traxsource.com/search/titles?term=${encodedSearch}`
      },
      {
        name: 'Bandcamp',
        icon: '/static/images/external-favicons/bandcamp-32.png',
        url: `https://bandcamp.com/search?q=${encodedSearch}&item_type=a`
      },
      {
        name: 'Discogs',
        icon: '/static/images/external-favicons/discogs-32.png',
        url: `https://www.discogs.com/search/?type=release&title=${encodeURIComponent(getInfo('title'))}&artist=${encodeURIComponent(getInfo('artist'))}`,
        shadow: true
      },
      {
        name: 'Discogs (by barcode)',
        icon: '/static/images/external-favicons/discogs-32.png',
        url: `https://www.discogs.com/search/?type=release&barcode=${getInfo('barcode')}`,
        shadow: true
      },
      {
        name: 'Amazon Music',
        icon: '/static/images/external-favicons/amazonmusic-32.png',
        url: `https://music.amazon.com/search/${encodeURIComponent(getInfo('artist'))
          .replace(/%20|%2F|%2D|%3A|%3B|%2C|%27|%22|%3F|%21|%26|%28|%29/g, '+')}+${encodeURIComponent(getInfo('title'))
          .replace(/%20|%2F|%2D|%3A|%3B|%2C|%27|%22|%3F|%21|%26|%28|%29/g, '+')}/albums?filter=IsLibrary%7Cfalse&sc=none`
      },
      {
        name: 'Metal Archives',
        icon: '/static/images/external-favicons/metalarchives-16.png',
        url: `https://www.metal-archives.com/search/advanced/searching/albums?bandName=${encodeURIComponent(getInfo('artist'))}&releaseTitle=${encodeURIComponent(getInfo('title'))}`
      },
      {
        name: 'MelOn',
        icon: '/static/images/external-favicons/melon-16.png',
        url: `https://www.melon.com/search/album/index.htm?q=${encodedSearch}`
      },
      {
        name: 'Bugs!',
        icon: '/static/images/external-favicons/bugs-32.png',
        url: `https://music.bugs.co.kr/search/album?q=${encodedSearch}`
      },
      {
        name: 'OTOTOY',
        icon: '/static/images/external-favicons/ototoy-32.png',
        url: `https://ototoy.jp/find/?q=${encodedSearch}`,
        shadow: true
      },
      {
        name: 'mora',
        icon: '/static/images/external-favicons/mora-32.png',
        url: `https://mora.jp/search/album?keyWord=${encodedSearch}`
      },
      {
        name: 'audiomack',
        icon: '/static/images/external-favicons/audiomack-32.png',
        url: `https://audiomack.com/search?q=${encodedSearch}`
      }
    ];

    const containerDiv = $(`
      <div class="search-container-div">
        <h3 style="width: max-content">Search options ▾</h3>
        <div id="search-buttons-div" class="search-buttons-div"></div>
      </div>
    `)
    .appendTo(getInfo('area'));

    for (let entry of releaseProviders) {
      // skip if there's no barcode
      if (entry.name.includes('(by barcode)') && !getInfo('barcode')) {
        continue;
      }

      $('#search-buttons-div').append(createButton(entry.name, entry.icon, entry.url, entry.shadow));
    }

    containerDiv.find('h3').on('click', function () {
      animateDiv();
    });
  }
}

function appendToRGPage() {
  const encodedSearch = `${encodeURIComponent(getInfo('artist'))}%20${encodeURIComponent(getInfo('title'))}`;
  const rgProviders = [
    {
      name: 'RateYourMusic',
      icon: '/static/images/external-favicons/rateyourmusic-32.png',
      url: `https://www.google.com/search?q=${encodeURIComponent(getInfo('title'))} by ${encodeURIComponent(getInfo('artist'))} site:rateyourmusic.com`
    },
    {
      name: 'Genius',
      icon: '/static/images/external-favicons/genius-32.png',
      url: `https://genius.com/search?q=${encodedSearch.replaceAll(/\(|\)/g, ' ')}`, //genius strips parentheses from searches
      shadow: true
    },
    {
      name: 'WikiData',
      icon: '/static/images/external-favicons/wikidata-32.png',
      url: `https://www.wikidata.org/w/index.php?search=${encodedSearch}`
    },
    {
      name: 'AllMusic',
      icon: '/static/images/external-favicons/allmusic-16.png',
      url: `https://www.allmusic.com/search/albums/${encodedSearch}`
    },
    {
      name: 'Discogs',
      icon: '/static/images/external-favicons/discogs-32.png',
      url: `https://www.discogs.com/search?type=master&title=${encodeURIComponent(getInfo('title'))}&artist=${encodeURIComponent(getInfo('artist'))}`,
      shadow: true
    },
  ];

  const containerDiv = $(`
    <div class="search-container-div">
      <h3 style="width: max-content">Search options ▾</h3>
      <div id="search-buttons-div" class="search-buttons-div"></div>
    </div>
  `)
  .appendTo(getInfo('area'));

  for (let entry of rgProviders) {
    $('#search-buttons-div').append(createButton(entry.name, entry.icon, entry.url, entry.shadow));
  }

  containerDiv.find('h3').on('click', function () {
    animateDiv();
  });
}

function run() {
  if (type === 'release') {
    appendToReleasePage();
  }
  else if (type === 'release-group') {
    appendToRGPage();
  }
}
window.setTimeout(run, 250);

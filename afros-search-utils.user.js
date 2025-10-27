// ==UserScript==
// @name        afro's search utilities
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-search-utils.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-search-utils.user.js
// @match       *://musicbrainz.org/*
// @match       *://beta.musicbrainz.org/*
// @match       *://musicbrainz.eu/*
// @exclude     /\/release\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/(discids|cover-art|aliases|tags|details|edit|edit-relationships|delete|change-quality|edits|open_edits)/
// @exclude     /\/release\/add/
// @version     0.3
// @author      afro
// @description Add external search options to release and release group pages
// ==/UserScript==

function css() {
  $('head').append(`<style>
  .search-icon-button {
    cursor: pointer;
    background: none;
    border: none;
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
    /* transition: max-height 0.5s ease; */
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
const type = window.location.pathname.split('/')[1];

function getInfo(request) {
  let title, artist, area;
  if (type === 'release') {
    title = $('.releaseheader bdi').first().text();
    artist = $('.subheader bdi').first().text();
    area = $('div.tracklist-and-credits');
  }
  else if (type === 'release-group') {
    title = $('h1 a').first().text();
    artist = $('.subheader bdi').first().text();
    area = $('#content');
  }

  if (request === 'artist') { return artist; }
  else if (request === 'title') { return title; }
  else if (request === 'area') { return area; }
}

function createButton(name, icon, searchURL) {
  //search or barcode lookup logic
  let url;
  if (typeof searchURL === 'object') {
    if (barcodeField.length === 0 || barcodeField.text() === '[none]') {
      url = searchURL.search;
    } else {
      url = searchURL.lookup;
    }
  } else {
    url = searchURL;
  }

  return $(`<a class="search-icon-button" href="${url}" target="_blank" title="Search this release on ${name}">
    <img src="${icon}" width="20px">
  </a>`);
}

const encodedSearch = `${encodeURIComponent(getInfo('artist'))}%20${encodeURIComponent(getInfo('title'))}`;
const releaseProviders = [
  {
    name: 'Spotify',
    icon: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
    url: {
      search: `https://open.spotify.com/search/${encodedSearch}/albums`,
      lookup: `https://open.spotify.com/search/upc%3A${barcodeField?.text() || null}`
    }
  },
  {
    name: 'Deezer',
    icon: 'https://cdn-files.dzcdn.net/cache/images/common/favicon/favicon.5e8e3be4042b873a7358.ico',
    url: `https://www.deezer.com/search/${encodedSearch}/album`
  },
  {
    name: 'Apple Music',
    icon: 'https://music.apple.com/assets/favicon/favicon-32.png',
    url: `https://music.apple.com/us/search?term=${encodedSearch}`
  },
  {
    name: 'Beatport',
    icon: 'https://www.beatport.com/images/favicon-48x48.png',
    url: `https://www.beatport.com/search/releases?q=${encodedSearch}&per_page=5`
  },
  {
    name: 'YouTube Music',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/YouTube_Music_logo_without_text.png',
    url: {
      search: `https://music.youtube.com/search?q=${encodedSearch}`,
      lookup: `https://music.youtube.com/search?q=&quot;${barcodeField?.text().replace(/^0+/, '')}&quot;`
    }
  },
  {
    name: 'Qobuz',
    icon: 'https://www.qobuz.com/assets-static/img/icons/favicon/apple-icon-180x180.png',
    url: `https://www.qobuz.com/us-en/search/albums/${encodedSearch.replace(/%2F/g, ' ')}`
  },
  {
    name: 'Beatsource',
    icon: 'https://www.beatsource.com/static/favicon/favicon-194x194.png',
    url: `https://www.beatsource.com/search/releases?q=${encodedSearch}`
  },
  {
    name: 'HDTracks',
    icon: 'https://www.hdtracks.com/favicon.ico',
    url: `https://www.hdtracks.com/#/search?q=${encodedSearch}`
  },
  {
    name: 'SoundCloud',
    icon: 'https://a-v2.sndcdn.com/assets/images/sc-icons/favicon-2cadd14bdb.ico',
    url: `https://soundcloud.com/search?q=${encodedSearch}`
  },
  {
    name: 'Traxsource',
    icon: 'https://www.traxsource.com/logos-and-images/logo-icon.png',
    url: `https://www.traxsource.com/search/titles?term=${encodedSearch}`
  },
  {
    name: 'Bandcamp',
    icon: 'https://s4.bcbits.com/img/buttons/bandcamp-button-circle-green-512.png',
    url: `https://bandcamp.com/search?q=${encodedSearch}&item_type=a`
  },
  {
    name: 'JunoDownload',
    icon: 'https://wwwcdn.junodownload.com/14121801/images/digital/icons/favicon-32x32.png',
    url: `https://www.junodownload.com/search/?solrorder=relevancy&q%5Bartist%5D%5B%5D=${encodeURIComponent(getInfo('artist'))}&q%5Btitle%5D%5B%5D=${encodeURIComponent(getInfo('title'))}`
  },
  {
    //discogs barcode lookup rarely works
    name: 'Discogs',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Discogs_logo.png',
    url: {
      search: `https://www.discogs.com/search/?type=release&title=${encodeURIComponent(getInfo('title'))}&artist=${encodeURIComponent(getInfo('artist'))}`,
      lookup: `https://www.discogs.com/search/?type=release&barcode=${barcodeField.text()}`
    }
  },
  {
    name: 'Amazon Music',
    icon: 'https://m.media-amazon.com/images/G/01/music/logo/1.0/smile_256x256.png',
    url: `https://music.amazon.com/search/${encodeURIComponent(getInfo('artist'))
      .replace(/%20|%2F|%2D|%3A|%3B|%2C|%27|%22|%3F|%21|%26|%28|%29/g, '+')}+${encodeURIComponent(getInfo('title'))
      .replace(/%20|%2F|%2D|%3A|%3B|%2C|%27|%22|%3F|%21|%26|%28|%29/g, '+')}/albums?filter=IsLibrary%7Cfalse&sc=none`
  },
  {
    name: 'Metal Archives',
    icon: 'https://www.metal-archives.com/favicon.ico',
    url: `https://www.metal-archives.com/search/advanced/searching/albums?bandName=${encodeURIComponent(getInfo('artist'))}&releaseTitle=${encodeURIComponent(getInfo('title'))}`
  },
  {
    name: 'MelOn',
    icon: 'https://cdnimg.melon.co.kr/resource/mobile40/cds/common/image/favicon.ico',
    url: `https://www.melon.com/search/album/index.htm?q=${encodedSearch}`
  },
  {
    name: 'Bugs!',
    icon: 'https://file.bugsm.co.kr/wbugs/common/faviconBugs.ico',
    url: `https://music.bugs.co.kr/search/album?q=${encodedSearch}`
  },
  {
    name: 'OTOTOY',
    icon: 'https://ototoy.jp/favicon.ico',
    url: `https://ototoy.jp/find/?q=${encodedSearch}`
  },
  {
    name: 'mora',
    icon: 'https://mora.jp/favicon.ico',
    url: `https://mora.jp/search/album?keyWord=${encodedSearch}`
  }
];

const rgProviders = [
  {
    name: 'RateYourMusic',
    icon: 'https://upload.wikimedia.org/wikipedia/en/d/d0/Rate_Your_Music_logo.svg',
    url: `https://www.google.com/search?q=${encodeURIComponent(getInfo('title'))} by ${encodeURIComponent(getInfo('artist'))} site:rateyourmusic.com`
  },
  {
    name: 'Genius',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/67/G_in_Genius.svg',
    url: `https://genius.com/search?q=${encodedSearch.replaceAll(/\(|\)/g, ' ')}` //genius strips parentheses from searches
  },
  {
    name: 'WikiData',
    icon: 'https://www.wikidata.org/static/images/icons/wikidatawiki.svg',
    url: `https://www.wikidata.org/w/index.php?search=${encodedSearch}`
  },
  {
    name: 'AllMusic',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/AllMusic_Logo.svg',
    url: `https://www.allmusic.com/search/albums/${encodedSearch}`
  },
]

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
  if ($('.format:contains("Digital Media")')) { //only on digital releases

    const containerDiv = $(`<div class="search-container-div"><h3 style="width: max-content">Search options ▾</h3>
      <div id="search-buttons-div" class="search-buttons-div"></div></div>`).appendTo(getInfo('area'));
    for (let entry of releaseProviders) {
      $('#search-buttons-div').append(createButton(entry.name, entry.icon, entry.url));
    }

    containerDiv.find('h3').on('click', function () {
      animateDiv();
    });
  }
}

function appendToRGPage() {
  const containerDiv = $(`<div class="search-container-div"><h3 style="width: max-content">Search options ▾</h3>
    <div id="search-buttons-div" class="search-buttons-div"></div></div>`).appendTo(getInfo('area'));
  for (let entry of rgProviders) {
    $('#search-buttons-div').append(createButton(entry.name, entry.icon, entry.url));
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
run();

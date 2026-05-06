// ==UserScript==
// @name         afro's sublinks
// @namespace    https://github.com/afrocatmusic/userscripts
// @updateURL    https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @downloadURL  https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @match        http*://*musicbrainz.*/*
// @grant        none
// @version      2026.5.6.2
// @author       afro
// @description  Mouse over links and press shift to open a menu with useful shortcuts
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

function css() {
  const classes = `
    .sublinksContainer {
      width: max-content;
      max-width: 20em;
      height: max-content;
      backdrop-filter: blur(3px);
      filter: drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.2));
      background: rgba(255, 255, 255, 0.75);
      border: 2px solid grey;
      border-radius: 5px;
      padding: 5px;
      position: absolute;
      z-index: 99;
      transition: 0.075s;
    }
    .sublinksContainer > ul {
      font-style: initial;
      list-style: none;
      padding: 0px;
      margin: 2px;
    }
    .svg-container {
      display: inline-block;
      padding: 1em 10px 0;
      float: right;
    }
    .sublinksContainer.tooltip {
      position: fixed;
      opacity: 0;
      transition: opacity 0.2s;
      white-space: pre-line;
      pointer-events: none;
      font-size: 80%;
      text-align: center;
    }
    .sublinksContainer.tooltip.visible {
      opacity: 1;
    }
    .sublinksContainer hr {
      opacity: 0.5;
    }
    .sublinksContainer > div {
      max-width: 10em;
    }
    .sublinks-header-text {
      user-select: none;
      display: inline-block;
      max-width: 15em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sublinks-header-text-wrapper {
      display: inline-block;
      max-width: 15em;
      vertical-align: middle;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    }
    .sublinks-header-text {
      display: inline-block;
      white-space: nowrap;
      font-weight: bold;
      text-overflow: ellipsis;
      overflow: hidden;
      vertical-align: middle;
      transition: transform linear;
      will-change: transform;
    }
    .sublinks-header-text-wrapper:hover .sublinks-header-text {
      overflow: visible;
      text-overflow: clip;
    }
  `;

  $(`<style id="afros_sublinks">`).text(classes).appendTo('head');
}
css();

// global variables
const stores = [
  {
    name: 'spotify',
    regex: /https:\/\/open\.spotify\.com\/(?:intl-\w{2}\/)?(album|artist)\/(\w{22})/,
    atisketKey: 'spf_id'
  },
  {
    name: 'applemusic',
    regex: /^https:\/\/music\.apple\.com\/\w{2}\/(album|artist)(?:(?:.*)?)\/(\d*)/,
    atisketKey: 'itu_id'
  },
  {
    name: 'itunes',
    regex: /^https:\/\/itunes\.apple\.com\/\w{2}\/(album|artist)(?:(?:.*)?)\/(?:id)?(\d*)/,
    atisketKey: 'itu_id'
  },
  {
    name: 'deezer',
    regex: /^https?:\/\/.*deezer\.com\/(?:\w{2}\/)?(album|artist)\/(\d*)/,
    atisketKey: 'deez_id'
  },
  {
    name: 'tidal',
    regex: /^https?:\/\/.*tidal\.com\/(?:browse\/)?(album|artist)\/(\d*)/
  },
  {
    name: 'beatport',
    regex: /^https?:\/\/(?:(?:www|pro|classic)\.)?beatport\.com(?:\/\w{2})?\/(release|artist)\/[^\/]+\/(\d+)/
  },
  {
    name: 'discogs',
    regex: /^https?:\/\/(?:www\.)?discogs\.com\/(?:.*)?(release|artist)\/(\d+)/
  },
  {
    name: 'bandcamp',
    regex: /^https?:\/\/([^.]+)\.bandcamp\.com\/(?:(track|album))?/
  },
  {
    name: 'soundcloud',
    regex: /soundcloud\.com\/([^\/]*)\/?$/
  },
  {
    name: 'qobuz',
    regex: /https?:\/\/(?:www|open|play).qobuz.com\/(?:\w{2}-\w{2}\/)?(interpreter|artist|album)\/(?:[^\/]+\/)?(\d+|[^\/]+)$/
  },
  {
    name: 'naver',
    regex: /https?:\/\/vibe\.naver\.com\/(artist)\/(\d+)/
  },
  {
    name: 'mora',
    regex: /https?:\/\/mora\.jp\/(package|artist)\/(\d+\/[\w-]+?|\d+)\/(?:\?.*)?/
  },
  {
    name: 'ototoy',
    regex: /https?:\/\/ototoy\.jp\/_\/default\/(p|a)\/(\d+)\/?/
  }
];
const entityHeaders = {
  artist: { name: 'Artist', icon: 'artist.svg' },
  release: { name: 'Release', icon: 'release.svg' },
  recording: { name: 'Recording', icon: 'recording.svg' },
  'release-group': { name: 'Release Group', icon: 'release_group.svg' },
  work: { name: 'Work', icon: 'work.svg' },
  area: { name: 'Area', icon: 'area.svg' },
  url: { name: 'URL entity', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Mismatch_finder_link_icon.png' },
  label: { name: 'Label', icon: 'label.svg' },
  tag: { name: 'Tag', icon: 'tag.svg' },
  genre: { name: 'Genre', icon: 'genre.svg' },
  instrument: { name: 'Instrument', icon: 'instrument.svg' },
  series: { name: 'Series', icon: 'series.svg' },
  user: { name: 'Editor', icon: 'editor.svg' },
  event: { name: 'Event', icon: 'event.svg'},
  place: { name: 'Place', icon: 'place.svg'}
};
const storeHeaders = {
  spotify: { name: 'Spotify', icon: 'spotify-32.png' },
  itunes: { name: 'iTunes', icon: 'itunes-16.png' },
  applemusic: { name: 'Apple Music', icon: 'applemusic-32.png' },
  deezer: { name: 'Deezer', icon: 'deezer-32.png' },
  beatport: { name: 'Beatport', icon: 'beatport-32.png' },
  tidal: { name: 'Tidal', icon: 'tidal-32.png' },
  discogs: { name: 'Discogs', icon: 'discogs-32.png' },
  bandcamp: { name: 'Bandcamp', icon: 'bandcamp-32.png' },
  soundcloud: { name: 'SoundCloud', icon: 'soundcloud-16.png' },
  qobuz: { name: 'Qobuz', icon: 'qobuz-32.png'},
  naver: { name: 'Naver', icon: 'navervibe-32.png' },
  mora: { name: 'mora', icon: 'mora-32.png' },
  ototoy: { name: 'Ototoy', icon: 'ototoy-32.png' }
};
const sublinkDisplayNames = {
  'aliases': 'Aliases',
  'area': 'Area',
  'artist': 'Artists',
  'artists': 'Artists',
  'cover-art': 'Cover art',
  'event-art': 'Event art',
  'details': 'Details',
  'discids': 'Disc IDs',
  'edit': 'Edit',
  'edit-relationships': 'Edit rels.',
  'edits': 'History',
  'event': 'Events',
  'events': 'Events',
  'fingerprints': 'Fingerprints',
  'instrument': 'Instruments',
  'label': 'Labels',
  'labels': 'Labels',
  'map': 'Map',
  'open_edits': 'Open edits',
  'performances': 'Performances',
  'place': 'Places',
  'places': 'Places',
  'ratings': 'Ratings',
  'recording': 'Recordings',
  'recordings': 'Recordings',
  'relationships': 'Relationships',
  'release': 'Releases',
  'release-group': 'Release groups',
  'release-groups': 'Release groups',
  'releases': 'Releases',
  'series': 'Series',
  'tags': 'Tags',
  'users': 'Users',
  'work': 'Works',
  'works': 'Works',
};
const mbRegexParts = {
  base: /(?:beta\.|test\.)?musicbrainz\.(org|eu)/.source,
  uuidEntities: /artist|event|label|place|recording|release|release-group|series|url|work|area|genre|instrument/.source,
  nonUUIDEntities: /tag|user/.source,
  UUID: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.source
}
const mbRegex = new RegExp(`${mbRegexParts.base}/(?:(?:${mbRegexParts.uuidEntities})/${mbRegexParts.UUID}|(?:${mbRegexParts.nonUUIDEntities})/[^\/]+)/?$`);
const digitalStoreRegexSources = stores.map(s => s.regex.source);
const digitalStoreRegex = new RegExp(digitalStoreRegexSources.join('|'));
const combinedRegex = new RegExp(`${mbRegex.source}|${digitalStoreRegex.source}`);

function createLi(linkInfo, target = '_self') {
  const li = $('<li>• <a></a></li>');
  li.find('a')
    .attr('href', linkInfo.href)
    .attr('target', target)
    .text(linkInfo.text);
  return li;
}

function addSublinksLogo() {
  //prevent unstyled text
  if (!document.querySelectorAll('[src="/static/scripts/supported-browser-check.js"]')[0]) return;

  // from https://www.svgrepo.com/svg/532198/list-ul-alt
  const svgIcon = `
    <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z"
            stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const menuArea = $('div.right div.bottom ul.menu');

  const svgContainer = $(`<div class="svg-container"></div>`).html(svgIcon);
  menuArea.append(svgContainer);

  const tooltipDiv = $(`
    <div id="tooltipDiv" class="sublinksContainer tooltip">afro's sublinks is active
      Hover over a link and press shift!
    </div>
  `).appendTo(menuArea);

  svgContainer.on('mouseover', function() {
    tooltipDiv.addClass('visible');
  });

  svgContainer.on('mousemove', function(e) {
    const offsetX = -160;
    const offsetY = -20;
    const rect = svgContainer[0].getBoundingClientRect();

    tooltipDiv.css({
      left: (rect.left + offsetX) + 'px',
      top: (e.clientY + offsetY) + 'px'
    });
  });

  svgContainer.on('mouseleave', function() {
    tooltipDiv.removeClass('visible');
  });
}
addSublinksLogo();

function generateLinkList(hoveredURL) {
  const linkOrder = [
    'releases', 'recordings', 'release-groups', 'works', 'events', 'performances', 'map',
    'relationships', 'discids', 'cover-art', 'event-art', 'fingerprints',
    'aliases', 'tags', 'ratings', 'details',
    'edit', 'edit-relationships', 'open_edits', 'edits'
  ];

  const common = ['/aliases', '/tags', '/details', '/edit', '/open_edits', '/edits'];

  const patterns = {
    'artist/': ['/releases', '/recordings', '/works', '/events', '/relationships', '/ratings', ...common],
    'recording/': ['/fingerprints', '/ratings', ...common],
    'release/': ['/discids', '/cover-art', '/edit-relationships', ...common],
    'release-group/': ['/ratings', ...common],
    'work/': ['/ratings', ...common],
    'label/': ['/relationships', '/ratings', ...common],
    'area/': ['/artists', '/events', '/labels', '/releases', '/recordings', '/places', '/users', '/works', ...common],
    'tag/': ['/artist', '/release-group', '/release', '/recording', '/work', '/label', '/place', '/area', '/instrument', '/series', '/event'],
    'genre/': ['/aliases', '/details', '/open_edits', '/edits'],
    'instrument/': ['/artists', '/releases', '/recordings', ...common],
    'series/': common,
    'url/': ['/edit', '/open_edits', '/edits'],
    'event/': ['/event-art', ...common],
    'place/': ['/events', '/performances', '/map', ...common]
  };

  const match = Object.keys(patterns).find(key => hoveredURL.includes(key));
  if (!match) return [];

  // sort them in the same order as the mb tabs
  const sortedSuffixes = patterns[match].sort((a, b) => {
    return linkOrder.indexOf(a.replace('/', '')) - linkOrder.indexOf(b.replace('/', ''));
  });

  return sortedSuffixes.map(suffix => {
    const key = suffix.replace('/', '');
    return createLi({
      href: hoveredURL + suffix,
      text: sublinkDisplayNames[key] || key
    });
  });
}

function matchDigitalStores(url) {

  const storeMatch = stores.find(s => url.match(s.regex));
  if (!storeMatch) return [];

  const rawMatch = url.match(storeMatch.regex);
  const platform = storeMatch.name;

  function getCorrectIDHelper(platform, rawMatch) {
    const firstGroup = ['bandcamp', 'soundcloud'];
    return firstGroup.includes(platform) ? rawMatch[1] : rawMatch[2];
  }

  const data = {
    url: url,
    platform: platform,
    id: getCorrectIDHelper(platform, rawMatch),
    isArtist: platform === 'bandcamp' ? !rawMatch[2] : ['artist', 'interpreter', 'a'].includes(rawMatch[1]),
    atisketKey: storeMatch.atisketKey
  };

  return getLinksForPlatform(data).map(link => createLi(link, '_blank'));
}

function getLinksForPlatform(data) {
  const links = [];

  const samblProviders = ['spotify', 'applemusic', 'deezer', 'tidal', 'bandcamp', 'soundcloud', 'naver', 'qobuz'];
  if (data.isArtist && samblProviders.includes(data.platform)) {
    links.push({
      text: 'SAMBL',
      href: `https://sambl.lioncat6.com/artist?provider_id=${data.id}&provider=${data.platform}`
    });
  }

  if (!data.isArtist && samblProviders.includes(data.platform)) {
    links.push({
      text: 'SAMBL',
      href: `https://sambl.lioncat6.com/find?query=${data.url}`
    })
  }

  const harmonyProviders = ['deezer', 'applemusic', 'itunes', 'spotify', 'tidal', 'bandcamp', 'beatport', 'mora', 'ototoy', 'discogs'];
  if (!data.isArtist && harmonyProviders.includes(data.platform)) {
    let harmonyURL = `https://harmony.pulsewidth.org.uk/release?`;
    if (data.platform === 'bandcamp') {
      harmonyURL += `url=${encodeURIComponent(data.url)}&category=preferred`;
    } else {
      const key = (data.platform === 'applemusic' || data.platform === 'itunes') ? 'itunes' : data.platform;
      harmonyURL += `${key}=${data.id}&category=preferred`;
    }
    links.push({ text: 'Harmony', href: harmonyURL });
  }

  const atisketProviders = ['spotify', 'itunes', 'applemusic', 'deezer'];
  if (!data.isArtist && atisketProviders.includes(data.platform) && data.atisketKey) {
    links.push({
      text: 'a-tisket',
      href: `https://atisket.pulsewidth.org.uk/?${data.atisketKey}=${data.id}`
    });
  }

  if (!data.isArtist && data.platform === 'discogs') {
    links.push({ text: 'Show history', href: `https://discogs.com/release/${data.id}/history` });
  }

  return links;
}

function generateUserLinkList(url) {
  let links = [];

  const parts = url.split('/');
  const userIndex = parts.indexOf('user');

  if (userIndex === -1 || !parts[userIndex + 1]) return links;

  const username = parts[userIndex + 1];

  const linkOptions = [
    {
      text: 'Edits',
      href: `/user/${username}/edits`
    },
    {
      text: 'Open edits',
      href: `/user/${username}/edits/open`
    },
    {
      text: '⤷ Review open edits',
      href: `/search/edits?auto_edit_filter=&order=asc&negation=0&combinator=and&conditions.0.field=editor&conditions.0.operator=%3D&conditions.0.name=${username}&conditions.1.field=status&conditions.1.operator=%3D&conditions.1.args=1&conditions.2.field=voter&conditions.2.operator=me&conditions.2.name=&conditions.2.voter_id=&conditions.2.args=no`
    },
    {
      text: '⤷ Review open edits, no covers',
      href: `/search/edits?auto_edit_filter=&order=asc&negation=0&combinator=and&conditions.0.field=editor&conditions.0.operator=%3D&conditions.0.name=${username}&conditions.1.field=status&conditions.1.operator=%3D&conditions.1.args=1&conditions.2.field=type&conditions.2.operator=!%3D&conditions.2.args=314&conditions.3.field=voter&conditions.3.operator=me&conditions.3.name=&conditions.3.voter_id=&conditions.3.args=no`
    },
    {
      text: 'Votes',
      href: `/user/${username}/votes`
    },
    {
      text: 'Collections',
      href: `/user/${username}/collections`
    },
    {
      text: 'Added releases',
      href: `/search/edits?auto_edit_filter=&conditions.0.field=editor&conditions.0.operator=%3D&conditions.0.name=${username}&combinator=and&conditions.1.field=type&conditions.1.operator=%3D&conditions.1.args=31,216&conditions.2.field=status&conditions.2.operator=%3D&conditions.2.args=2&negation=0&order=desc`
    },
    {
      text: '⤷ albums',
      href: `/search/edits?auto_edit_filter=&order=desc&negation=0&combinator=and&conditions.0.field=editor&conditions.0.operator=%3D&conditions.0.name=${username}&conditions.1.field=type&conditions.1.operator=%3D&conditions.1.args=31%2C216&conditions.2.field=status&conditions.2.operator=%3D&conditions.2.args=2&conditions.5.field=release_group_primary_type&conditions.5.operator=%3D&conditions.5.args=1`
    },
    {
      text: '⤷ remix',
      href: `/search/edits?auto_edit_filter=&order=desc&negation=0&combinator=and&conditions.0.field=editor&conditions.0.operator=%3D&conditions.0.name=${username}&conditions.1.field=type&conditions.1.operator=%3D&conditions.1.args=31%2C216&conditions.2.field=status&conditions.2.operator=%3D&conditions.2.args=2&conditions.4.field=release_group_secondary_type&conditions.4.operator=%3D&conditions.4.args=7`
    },
    {
      text: 'Added or edited mediums',
      href: `/search/edits?auto_edit_filter=&order=desc&negation=0&combinator=and&conditions.0.field=editor&conditions.0.operator=%3D&conditions.0.name=${username}&conditions.1.field=type&conditions.1.operator=%3D&conditions.1.args=51&conditions.1.args=52&field=Please+choose+a+condition`
    }
  ];

  function setSublinksLocalStorage() {
    localStorage.setItem('afros_sublinks_editSearch_autoSelect', true);
  }

  links = linkOptions.map((linkInfo) => {
    const li = createLi(linkInfo, '_self');
    li.find('a').on('click auxclick', setSublinksLocalStorage);
    return li;
  });

  return links;
}

function autoCheckEditorName() {
  const localStorageKey = 'afros_sublinks_editSearch_autoSelect';
  // Only run if coming from sublinks click
  if (!localStorage.getItem(localStorageKey)) return;

  const searchParamsError = 'Oops! It seems your search parameters are not correct, please double check your input!';

  if (window.location.href.includes('/search/edits')) {
    const errorMsg = $(`p:contains(${searchParamsError})`);

    if (errorMsg.length > 0) {
      if (errorMsg.prev().children().attr('class') === 'field field-editor predicate-user') {

        errorMsg.text(`afro's sublinks: selecting editor username...`)
          .css({
            'font-weight': 'bold',
            'background-color': 'rgba(35, 245, 247, 0.3)',
            'max-width': 'max-content',
            'border-radius': '5px',
            'padding': '5px'
          });

        let editorUsername = $('.field.field-editor.predicate-user').first().find('input').val();
        let searchButton = $('.field.field-editor.predicate-user > .arg.autocomplete.editor').find('img');
        const inputField = $('.field.field-editor.predicate-user').first().find('input');

        searchButton.click();

        let maxTries = 20;
        let tryCount = 0;

        const checkDropdown = setInterval(() => {
          tryCount++;
          const dropdown = $('#ui-id-1.ui-autocomplete');
          const correctListItem = dropdown.find('li > a').filter(function() {
            return $(this).text() === editorUsername;
          }).parent('li');

          if (correctListItem.length === 1 && (dropdown.children().length > 1 && dropdown.first().text() !== '(No results)')) {
            clearInterval(checkDropdown);

            //100ms delay between finding the right list entry and clicking it
            setTimeout(() => {
              correctListItem.trigger('mousedown');
              correctListItem.trigger('mouseup');
              correctListItem.click();
              localStorage.removeItem(localStorageKey);

              //and another 100ms before clicking the submit button
              setTimeout(() => {
                $('#edit-search-submit').find('button').click();
              }, 100);

            }, 100);

          } else if (tryCount >= maxTries) {
            clearInterval(checkDropdown);
            console.log('max attempts reached');
            localStorage.removeItem(localStorageKey);
          }
        }, 250); //checking every 250ms
      }
    }
  }
}
autoCheckEditorName();

function createMovableContainer() {
  const container = $(`
    <div id="sublinksContainer" class="sublinksContainer" style="display: none">
      <ul id="linkList"></ul>
    </div>
  `);
  $('body').append(container);
}
createMovableContainer();

let hoveredObject = null;
let mouseX = 0;
let mouseY = 0;

// event listeners at document level
document.addEventListener('mouseover', (e) => {
  const link = e.target.closest('a');
  if (link && combinedRegex.test(link.href)) {
    hoveredObject = link;
  } else {
    hoveredObject = null; // reset on non-matching links
  }
});

document.addEventListener('mousemove', (e) => {
  if (hoveredObject) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
});

document.addEventListener('mouseleave', (e) => {
  if (e.target.parentNode !== null && e.target.closest('a') === hoveredObject) {
    hoveredObject = null;
  }
});

function extractEntity(url) {
  const mbEntities = Object.keys(entityHeaders);
  const streamingPlats = Object.keys(storeHeaders);

  const parsedURL = new URL(url);
  const hostname = parsedURL.hostname;
  const pathParts = parsedURL.pathname.split('/').filter(n => n);

  let entity = [];

  if (hostname.includes('musicbrainz')) {
    entity.push('mb');
    const type = pathParts.find(part => mbEntities.includes(part));
    entity.push(type);
  }
  else {
    const platform = streamingPlats.find(plat => {
      if (plat === 'applemusic') return hostname.includes('music.apple.com');
      if (plat === 'itunes') return hostname.includes('itunes.apple.com');
      return hostname.includes(plat);
    });

    if (platform) {
      entity.push(platform);
      if (pathParts.includes('artist')) entity.push('artist');
      else if (pathParts.includes('release') || pathParts.includes('album')) entity.push('release');
    }
  }
  return entity.length > 0 ? entity : null;
}

function generateLinks(hoveredObject) {
  const hoveredURL = hoveredObject.href;
  const entityType = extractEntity(hoveredURL);

  if (!entityType) return [];
  const [platform, type] = entityType;

  if (type === 'user') return generateUserLinkList(hoveredURL);
  if (platform === 'mb' && type !== 'user') return generateLinkList(hoveredURL);
  if (platform !== 'mb') return matchDigitalStores(hoveredURL);
}

function getHeaderContent(hoveredObject, entityData) {
  const [platform, type] = entityData;

  if (platform === 'mb') {
    const header = entityHeaders[type];
    let iconURL = type === 'url' ? header.icon : `/static/images/entity/${header.icon}`;

    let headerText = hoveredObject.textContent;

    if (type === 'url') return { icon: iconURL, text: header.name };

    let releaseInfoJSON = null;
    const hovTextStartsWithCheck = hoveredObject.textContent.startsWith('see all versions of this release');
    const ldScript = document.querySelector('script[type="application/ld+json"]');
    releaseInfoJSON = ldScript ? JSON.parse(ldScript.textContent) : null;

    if (type === 'release-group' && hovTextStartsWithCheck && location.pathname.includes('/release/') && releaseInfoJSON) {
      headerText = releaseInfoJSON.releaseOf.name;
    }
    else if (hovTextStartsWithCheck && !releaseInfoJSON) {
      headerText = 'Release group';
    }

    if (type === 'user') {
      const userMatch = hoveredObject.href.match(/\/user\/([^\/]+)/);
      headerText = userMatch ? decodeURIComponent(userMatch[1]) : header.name;
    }

    const img = hoveredObject.querySelector('img');
    if (img && (type === 'release' || type === 'release-group')) {
      headerText = img.alt || img.title || hoveredObject.title || headerText;
    }

    return { icon: iconURL, text: headerText };
  }
  else {
    const header = storeHeaders[platform];
    return {
      icon: `/static/images/external-favicons/${header.icon}`,
      text: header.name
    };
  }
}


//animate the header text, scroll until the end of the string, pause for 2s, then reset and loop
function headerScrollAnimation(headerWrapper, headerText) {
  let timers = { start: null, end: null };
  let hovering = false;

  function clearTimers() {
    if (timers.start) {
      clearTimeout(timers.start);
      timers.start = null;
    }
    if (timers.end) {
      clearTimeout(timers.end);
      timers.end = null;
    }
  }

  function startScrollLoop() {
    hovering = true;
    clearTimers();
    //reset transform
    headerText.style.transition = 'none';
    headerText.style.transform = 'translateX(0)';

    timers.start = setTimeout(() => {
      if (!hovering) return;
      const wrapperWidth = headerWrapper.clientWidth;
      const textWidth = headerText.scrollWidth;
      if (textWidth <= wrapperWidth + 1) {
        return
      }

      const distance = textWidth - wrapperWidth;
      const pxPerSecond = 40; // scroll speed
      const durationMs = (distance / pxPerSecond) * 1000;

      function animateOnce() {
        if (!hovering) return;
        //set transition and move
        headerText.style.transition = `transform ${durationMs}ms linear`;
        //start the transform
        requestAnimationFrame(() => {
          headerText.style.transform = `translateX(-${distance}px)`;
        });

        timers.end = setTimeout(() => {
          if (!hovering) return;
          headerText.style.transition = 'none';
          headerText.style.transform = 'translateX(0)';

          timers.start = setTimeout(() => {
            animateOnce();
          }, 50);
        }, durationMs + 2000); //duration + 2s pause at the end
      }

      animateOnce();
    }, 50);
  }

  function stopScrollLoop() {
    hovering = false;
    clearTimers();
    //reset immediately
    headerText.style.transition = 'none';
    headerText.style.transform = 'translateX(0)';
  }

  headerWrapper.addEventListener('mouseenter', startScrollLoop);
  headerWrapper.addEventListener('mouseleave', stopScrollLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Shift' && hoveredObject) {
    const entityData = extractEntity(hoveredObject.href);
    if (!entityData) return;

    const listItems = generateLinks(hoveredObject);
    const headerContent = getHeaderContent(hoveredObject, entityData);

    if (listItems && listItems.length > 0) {
      const container = $('#sublinksContainer');
      const list = $('#linkList');

      list.empty();
      container.css({
        display: 'block',
        left: (mouseX + 10) + 'px',
        top: (mouseY + 10) + 'px'
      });

      if (headerContent) {
        const headerDiv = $('<div style="display: flex; align-items: center;"></div>');
        const headerIcon = $(`<img src="${headerContent.icon}" style="height: 15px; width: 15px; margin-right: 5px;">`);
        const headerWrapper = $('<div class="sublinks-header-text-wrapper"></div>');
        const headerText = $('<span class="sublinks-header-text"></span>').text(headerContent.text);

        headerWrapper.append(headerText);
        headerDiv.append(headerIcon, headerWrapper);

        list.append(headerDiv, $('<hr>'));

        headerScrollAnimation(headerWrapper[0], headerText[0]);
      }

      list.append(listItems);
    }
  }
});

document.addEventListener('click', (event) => {
  //close div if click outside
  if (!event.target.closest('.sublinksContainer')) {
    document.getElementById('sublinksContainer').style.display = 'none';
    let linkList = $('#linkList');
    linkList.empty();
  }
});

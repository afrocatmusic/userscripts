// ==UserScript==
// @name         afro's sublinks
// @namespace    https://github.com/afrocatmusic/userscripts
// @updateURL    https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @downloadURL  https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @match        *://*.musicbrainz.org/*
// @match        *://musicbrainz.eu/*
// @exclude      https://musicbrainz.*/oauth2/authorize*
// @grant        none
// @version      0.8.1
// @author       afro
// @description  Mouse over links and press shift to open a menu with useful shortcuts
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

function css() {
  let head = document.getElementsByTagName('head')[0];
  if (head) {
    let style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'afros_sublinks');
    style.textContent = `
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
    head.appendChild(style);
  }
}
css();

function addSublinksLogo() {
  //prevent unstyled text
  if (!document.querySelectorAll('[src="/static/scripts/supported-browser-check.js"]')[0]) { return; } //doesn't work with jquery selector

  // from https://www.svgrepo.com/svg/532198/list-ul-alt
  const svgIcon = `
    <svg width="15px" height="15px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z"
            stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  const svgContainer = document.createElement('div');
  svgContainer.innerHTML = svgIcon;
  svgContainer.setAttribute('class', 'svg-container');
  const area = $('.menu')[1];
  area.append(svgContainer);
  // tooltip div
  const tooltipDiv = document.createElement('div');
  tooltipDiv.setAttribute('class', 'sublinksContainer tooltip');
  tooltipDiv.style.display = 'block';
  tooltipDiv.textContent = 'afro\'s sublinks is active\nHover over a link and press shift!';
  document.body.appendChild(tooltipDiv);

  svgContainer.addEventListener('mouseover', () => {
    tooltipDiv.classList.add('visible');
  });
  svgContainer.addEventListener('mousemove', (event) => {
    //sublinks window position offset
    const offsetX = -170; //px to the right
    const offsetY = -20; //px down
    tooltipDiv.style.left = `${svgContainer.getBoundingClientRect().left + offsetX}px`;
    tooltipDiv.style.top = `${event.clientY + offsetY}px`;
  });
  svgContainer.addEventListener('mouseleave', () => {
    tooltipDiv.classList.remove('visible');
  });
}
addSublinksLogo();

function generateLinkList(hoveredURL) {
  let links = [];
  const patterns = {
    'artist/': [
      '/releases',
      '/recordings',
      '/works',
      '/events',
      '/relationships',
      '/aliases',
      '/tags',
      '/ratings',
      '/details',
      '/edit',
      '/open_edits',
      '/edits',
    ],
    'recording/': [
      '/fingerprints',
      '/aliases',
      '/tags',
      '/ratings',
      '/details',
      '/edit',
      '/open_edits',
      '/edits',
    ],
    'release/': [
      '/discids',
      '/cover-art',
      '/aliases',
      '/tags',
      '/details',
      '/edit',
      '/edit-relationships',
      '/open_edits',
      '/edits',
    ],
    'release-group/': [
      '/aliases',
      '/tags',
      '/ratings',
      '/details',
      '/edit',
      '/open_edits',
      '/edits',
    ],
    'work/': [
      '/aliases',
      '/tags',
      '/ratings',
      '/details',
      '/edit',
      '/open_edits',
      '/edits',
    ],
    'area/': [
      '/artists',
      '/events',
      '/labels',
      '/releases',
      '/recordings',
      '/places',
      '/users',
      '/works',
      '/aliases',
      '/tags',
      '/details',
      '/open_edits',
      '/edits',
    ],
    'url/': [
      '/edit',
      '/open_edits',
      '/edits'
    ],
    'label/': [
      '/relationships',
      '/aliases',
      '/tags',
      '/ratings',
      '/details',
      '/edit',
      '/open_edits',
      '/edits',
    ],
    'tag/': [
      '/artist',
      '/release-group',
      '/release',
      '/recording',
      '/work',
      '/label',
      '/place',
      '/area',
      '/instrument',
      '/series',
      '/event',
    ],
    'genre/': [
      '/aliases',
      '/details',
      '/open_edits',
      '/edits',
    ],
    'instrument/': [
      '/artists',
      '/releases',
      '/recordings',
      '/aliases',
      '/tags',
      '/details',
      '/open_edits',
      '/edits',
    ],
  };

  for (const entity in patterns) {
    if (hoveredURL.includes(entity)) {
      links = patterns[entity].map((suffix) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = hoveredURL + suffix;
        a.textContent = suffix.replace('/', '');
        let aTextMap = new Map([
          //name of menu options
          ['aliases', 'Aliases'],
          ['area', 'Area'],
          ['artist', 'Artists'], //singular into plural for /tag matching
          ['artists', 'Artists'],
          ['cover-art', 'Cover art'],
          ['details', 'Details'],
          ['discids', 'Disc IDs'],
          ['edit', 'Edit'],
          ['edit-relationships', 'Edit rels.'],
          ['edits', 'History'],
          ['event', 'Events'],
          ['events', 'Events'],
          ['fingerprints', 'Fingerprints'],
          ['instrument', 'Instruments'],
          ['label', 'Labels'],
          ['labels', 'Labels'],
          ['open_edits', 'Open edits'],
          ['place', 'Places'],
          ['places', 'Places'],
          ['ratings', 'Ratings'],
          ['recording', 'Recordings'],
          ['recordings', 'Recordings'],
          ['relationships', 'Relationships'],
          ['release', 'Releases'],
          ['release-group', 'Release groups'],
          ['release-groups', 'Release groups'],
          ['releases', 'Releases'],
          ['series', 'Series'],
          ['tags', 'Tags'],
          ['users', 'Users'],
          ['work', 'Works'],
          ['works', 'Works'],
        ]);
        if (aTextMap.has(a.textContent)) {
          a.textContent = aTextMap.get(suffix.replace('/', ''));
        }
        a.target = '_self';
        li.append(document.createTextNode('• '), a);
        return li;
      });
      break;
    }
  }
  return links;
}

function matchDigitalStores(url) {
  const stores = [
    { name: 'spotify', regex: /https:\/\/open\.spotify\.com\/(?:intl-\w{2}\/)?album\/(\w{22})/, atisketKey: 'spf_id' },
    { name: 'itunes', regex: /^https:\/\/(?:music\.|itunes\.)apple\.com\/\w{2}\/album(?:(?:.*)?)\/(?:id)?(\d*)/, atisketKey: 'itu_id' },
    { name: 'deezer', regex: /^https?:\/\/.*deezer\.com\/(?:\w{2}\/)?album\/(\d*)/, atisketKey: 'deez_id' },
    { name: 'beatport', regex: /^https?:\/\/.*beatport\.com\/release\/.*\/(\d*)/ },
    { name: 'tidal', regex: /^https?:\/\/.*tidal\.com\/(?:browse\/)?album\/(\d*)/ },
    { name: 'discogs', regex: /^https?:\/\/(?:www\.)?discogs\.com\/(?:.*)?release\/(\d+)(?:-.*|\/.*)?/ }
  ];

  for (const store of stores) {
    const match = url.match(store.regex);
    if (match) {
      const uid = match[1];
      const platform = store.name;
      let headerPlatform = platform;

      // change headerPlatform based on the subdomain for apple links
      if (platform === 'itunes' && url.includes('music.apple.com')) {
        headerPlatform = 'applemusic';
      }

      let links = [];

      if (platform === 'discogs') { //deal with discogs
        links.push({ href: `https://discogs.com/release/${uid}/history`, text: 'Show history' });
      } else {
        // Harmony for everything else
        links.push({ href: `https://harmony.pulsewidth.org.uk/release?${platform}=${uid}&category=preferred`, text: 'Harmony' });
      }

      if (store.atisketKey) { // except if atisketKey exists, add atisket link
        const atisketURL = `https://atisket.pulsewidth.org.uk/?${store.atisketKey}=${uid}`;
        links.push({ href: atisketURL, text: 'a-tisket' });
      }

      return links.map(linkInfo => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = linkInfo.href;
        a.textContent = linkInfo.text;
        a.target = '_blank';
        li.append('• ', a);
        return li;
      });
    }
  }

  return [];
}

function createMovableContainer() {
  let sublinksContainer = document.createElement('div');
  $('body').append(sublinksContainer);
  sublinksContainer.setAttribute('class', 'sublinksContainer');
  sublinksContainer.setAttribute('id', 'sublinksContainer');
  sublinksContainer.style.display = 'none';

  let list = document.createElement('ul');
  list.setAttribute('id', 'linkList');
  sublinksContainer.appendChild(list);
}
createMovableContainer();

let hoveredObject = null;
let mouseX = 0;
let mouseY = 0;

const mbRegex = /musicbrainz\.(org|eu)\/(.*\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|tag\/.*)$/;
const digitalStoreRegex = /spotify\.com\/(?:intl-\w{2}\/)?album\/|apple\.com\/\w{2}\/album|deezer\.com\/album|beatport\.com\/release|tidal\.com\/album|discogs\.com\/(?:.*)?release/;

const combinedRegex = new RegExp(`${mbRegex.source}|${digitalStoreRegex.source}`);

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
};

const storeHeaders = {
  spotify: { name: 'Spotify', icon: 'spotify-32.png' },
  itunes: { name: 'iTunes', icon: 'itunes-16.png' },
  'applemusic': { name: 'Apple Music', icon: 'applemusic-32.png' },
  deezer: { name: 'Deezer', icon: 'deezer-32.png' },
  beatport: { name: 'Beatport', icon: 'beatport-32.png' },
  tidal: { name: 'Tidal', icon: 'tidal-32.png' },
  discogs: { name: 'Discogs', icon: 'discogs-32.png' },
};

function getHeaderText(entity, text) {
  const uuidPattern = '\\s(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})';
  let result = '';

  const entityNames = Object.keys(entityHeaders);

  if (entityNames.includes(entity)) {
    const regex = new RegExp(entity + uuidPattern);

    if (text.search(regex) > -1) {
      result = entityHeaders[entity].name;
    }
  }
  return result;
}

function getMBHeaderContent(hoveredObject, entity, entityHeaders) {
  const hoveredURL = hoveredObject.href;
  const header = entityHeaders[entity];
  let iconURL = `https://musicbrainz.org/static/images/entity/${header.icon}`;
  let headerText = hoveredObject.textContent;

  if (entity === 'url') { //deal with url entity
    iconURL = header.icon;
    headerText = header.name;
  }
  //deal with subheader RG text, "see all versions of this release..."
  if (entity === 'release-group' && $(hoveredObject).parent().parent().hasClass('subheader')) {
    headerText = 'Release group';
  }

  const newHeaderText = getHeaderText(entity, hoveredObject.textContent);
  if (newHeaderText) {
    headerText = newHeaderText;
  }
  return { icon: iconURL, text: headerText };
}

function getStoreHeaderContent(url) {
  let storeKey = null;
  //deal with apple stores first
  if (url.includes('music.apple.com')) {
    storeKey = 'applemusic';
  }
  else if (url.includes('itunes.apple.com')) {
    storeKey = 'itunes';
  }
  else {
    for (const store in storeHeaders) {
      if (store === 'itunes' || store === 'applemusic') continue; //ignore apple, has been dealt with atp
      if (url.includes(store)) {
        storeKey = store;
        break;
      }
    }
  }
  if (storeKey) {
    const header = storeHeaders[storeKey];
    const iconURL = `https://musicbrainz.org/static/images/external-favicons/${header.icon}`;
    return { icon: iconURL, text: header.name }
  }
  return null; //if no store match
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
      if (!hovering) { return };
      const wrapperWidth = headerWrapper.clientWidth;
      const textWidth = headerText.scrollWidth;
      if (textWidth <= wrapperWidth + 1) {
        return
      }

      const distance = textWidth - wrapperWidth;
      const pxPerSecond = 40; // scroll speed
      const durationMs = (distance / pxPerSecond) * 1000;

      function animateOnce() {
        if (!hovering) { return };
        //set transition and move
        headerText.style.transition = `transform ${durationMs}ms linear`;
        //start the transform
        requestAnimationFrame(() => {
          headerText.style.transform = `translateX(-${distance}px)`;
        });

        timers.end = setTimeout(() => {
          if (!hovering) { return };
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
  if (event.key === 'Shift' && hoveredObject && combinedRegex.test(hoveredObject.href)) {
    let listItems = [];
    const hoveredURL = hoveredObject.href;
    let headerContent = null;

    if (mbRegex.test(hoveredURL)) { //match MB entities
      listItems = generateLinkList(hoveredURL);
      for (const entity in entityHeaders) {
        if (hoveredURL.includes(`/${entity}/`)) {
          headerContent = getMBHeaderContent(hoveredObject, entity, entityHeaders)
          break;
        }
      }
    }
    else if (digitalStoreRegex.test(hoveredURL)) { //match digital stores
      listItems = matchDigitalStores(hoveredURL);
      headerContent = getStoreHeaderContent(hoveredURL)
    }

    if (listItems.length > 0) {
      let container = document.getElementById('sublinksContainer');
      let list = document.getElementById('linkList');
      list.innerHTML = '';
      container.style.display = 'block';
      container.style.left = mouseX + 10 + 'px';
      container.style.top = mouseY + 10 + 'px';

      if (headerContent) {
        // scroll text
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.alignItems = 'center';

        const headerIcon = document.createElement('img');
        headerIcon.src = headerContent.icon;
        headerIcon.style.height = '15px';
        headerIcon.style.width = '15px';
        headerIcon.style.marginRight = '5px';

        const headerWrapper = document.createElement('div');
        headerWrapper.className = 'sublinks-header-text-wrapper';

        const headerText = document.createElement('span');
        headerText.className = 'sublinks-header-text';
        headerText.textContent = headerContent.text;

        headerWrapper.appendChild(headerText);
        headerDiv.appendChild(headerIcon);
        headerDiv.appendChild(headerWrapper);
        list.appendChild(headerDiv);
        list.appendChild(document.createElement('hr'));

        headerScrollAnimation(headerWrapper, headerText);
      }
      listItems.forEach((item) => list.appendChild(item));
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

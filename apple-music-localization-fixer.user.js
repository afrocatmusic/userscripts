// ==UserScript==
// @name        Apple Music localization fixer
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/apple-music-localization-fixer.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/apple-music-localization-fixer.user.js
// @homepageURL https://github.com/afrocatmusic/userscripts/blob/main/apple-music-localization-fixer.user.js
// @supportURL  https://github.com/afrocatmusic/userscripts/issues
// @match       https://*.musicbrainz.org/artist/*
// @match       https://*.musicbrainz.eu/artist/*
// @grant       none
// @version     2026.07.21.4
// @author      afro
// @icon        https://music.apple.com/assets/favicon/favicon-16.png
// @description Edits the localization of Apple Music and iTunes URLs to match the entity's area
// @run-at      document-idle
// ==/UserScript==

async function addToUI() {
  const artistPropertiesSection = document.querySelector('dl.properties');
  const artistArea = artistPropertiesSection.querySelector('dd.area');
  if (!artistArea) return;

  const allExternalLinks = document.querySelector('#sidebar ul.external_links');
  const amLiElems = allExternalLinks.querySelectorAll('.applemusic-favicon');
  if (!allExternalLinks || !amLiElems.length) return;

  const artistMBID = location.pathname.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0];

  // the two last letters of the class name of the last flag in the area selector
  const flags = artistArea.querySelectorAll('span.flag');
  const artistCountryCode = flags[flags.length - 1].className.match(/\w{2}$/)[0].toLowerCase();
  if (!artistCountryCode) return;

  // don't add a button if the only am link has the correct localization
  if (amLiElems.length === 1 && amLiElems[0].firstChild.href.includes(`/${artistCountryCode}/`)) return;

  // run if there's more than one link, or if the only link is not the correct localization
  if (amLiElems.length > 1 || !amLiElems[0].firstChild.href.includes(`/${artistCountryCode}/`)) {
    const rels = await apiCall(artistMBID);
    // skip any rels with the correct localization
    const targetRels = rels.filter((e) => !e.url.includes(`/${artistCountryCode}/`));
    const lastAMLink = amLiElems[amLiElems.length - 1];

    const li = document.createElement('li');
    li.className = 'buttons';
    li.style.display = 'inline-block';

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Edit URL localization';

    function seedEdit(urlMBID, oldURL) {
      // returns seeded url to be opened in a new tab
      const newURL = oldURL.replace(/\/\w{2}\//, `/${artistCountryCode}/`);
      const editNoteLines = [
        `Changing URL localization to match this entity's area (${artistCountryCode.toUpperCase()})`,
        `${location.origin}/artist/${artistMBID}`,
        `${oldURL} → ${newURL}`,
        `-`,
        `Using the ${GM_info.script.name} script - ${GM_info.script.homepageURL}`
      ];

      const editNote = editNoteLines.join('\n');

      return `/url/${urlMBID}/edit?edit-url.url=${newURL}&edit-url.edit_note=${encodeURIComponent(editNote)}`;
    }

    button.addEventListener('click', () => {
      targetRels.forEach(r => {
        window.open(seedEdit(r.mbid, r.url), '_blank');
      });
    });

    li.appendChild(button);
    lastAMLink.after(li);
  }
}

async function apiCall(mbid) {
  // fetch apple music rels of this mbid
  const url = `/ws/2/artist/${mbid}?inc=url-rels&fmt=json`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': `${GM_info.script.name}/${GM_info.script.version} ( https://musicbrainz.org/user/afrocat / https://github.com/afrocatmusic )`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const relations = data.relations || [];

    const amRels = relations
      .filter((rel) => rel.url?.resource?.includes('apple.com'))
      .map((rel) => ({
        mbid: rel.url.id,
        url: rel.url.resource
      }));

    // prevent duplicates by relationship type
    // like streaming / purchase
    const dedupedRels = Array.from(
      new Map(amRels.map((item) => [item.mbid, item])).values()
    );

    return dedupedRels;
  }
  catch (error) {
    console.log(`Failed to fetch: ${mbid}`);
    return [];
  }
}

addToUI();

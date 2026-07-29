// ==UserScript==
// @name        MBz Blur NSFW cover art
// @namespace   https://github.com/afrocatmusic/userscripts
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/MBz-Blur-NSFW-cover-art.user.js
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/MBz-Blur-NSFW-cover-art.user.js
// @homepageURL https://github.com/afrocatmusic/userscripts/blob/main/MBz-Blur-NSFW-cover-art.user.js
// @supportURL  https://github.com/afrocatmusic/userscripts/issues
// @match       http*://*.musicbrainz.org/*
// @match       http*://*.musicbrainz.eu/*
// @grant       GM_info
// @version     2026.7.29.2
// @author      afro
// @description Blurs NSFW cover art if it's tagged as such
// @require     https://code.jquery.com/jquery-3.7.1.min.js
// @icon        https://upload.wikimedia.org/wikipedia/commons/f/f5/18%2B_icon.svg
// ==/UserScript==

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const nsfwTags = [
  'nsfw cover art',
  'nude cover',
  'boobs on cover',
  'pornogrind',
  'hentai',
  'nsfw',
  'nsfw cover',
  'porn cover',
  'gore',
  'gore cover',
  'gore on cover',
  'gore in cover',
  // add more here
];

const cacheKey = 'mbz_nsfw_tags_cache';
// to clear the cache manually, paste the next line into the browser's console
// localStorage.removeItem('mbz_nsfw_tags_cache')
const cacheTimeout = 120 * 60 * 1000; // cache lasts two hours

function loadCache() {
  try {
    const stored = localStorage.getItem(cacheKey);
    return stored ? JSON.parse(stored) : {};
  }
  catch (e) {
    return {};
  }
}

function saveCache(cacheData) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }
  catch (e) {
    console.warn('Failed to write to localStorage: ', e);
  }
}

function addBlurClass() {
  $(`<style id="nsfw-cover-blur">
      .blurredCover {
        filter: blur(10px);
        transition: filter 0.1s ease-in-out;
        clip-path: border-box;
      }
      .blurredCover:hover {
        filter: blur(0px);
      }
    </style>`)
    .appendTo($('head'));
}

function extractMbidInfo(imgElement) {
  const mbidRegex = /\/(release-group|release)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

  let match = imgElement.src.match(mbidRegex);
  if (match) {
    return { entityType: match[1].toLowerCase(), mbid: match[2] };
  }

  const parentLink = $(imgElement).parents('a.artwork-image')[0];

  if (parentLink && parentLink.href) {
    match = parentLink.href.match(mbidRegex);
    if (match) {
      return { entityType: match[1].toLowerCase(), mbid: match[2] };
    }
  }

  return null;
}

async function getTagsForEntity(entityType, mbid) {
  const cache = loadCache();
  const now = Date.now();

  if (cache[mbid] && (now - cache[mbid].timestamp < cacheTimeout)) {
    return cache[mbid].tags;
  }

  const apiUrl = `/ws/2/${entityType}/${mbid}?inc=tags+genres&fmt=json`;
  const userAgent = `${GM_info.script.name} / ${GM_info.script.version} ( https://musicbrainz.org/user/afrocat / ${GM_info.script.namespace} )`;

  try {
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': userAgent }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const tags = (data.tags || []).map(t => t.name.toLowerCase());

    cache[mbid] = {
      tags: tags,
      timestamp: now
    };
    saveCache(cache);

    await sleep(1100); // 1.1s to respect api rate limit
    return tags;

  }
  catch (error) {
    console.error(`Error fetching tags for ${mbid}:`, error);
    cache[mbid] = { tags: [], timestamp: now };
    saveCache(cache);
    return [];
  }
}

async function processCovers() {
  const artworkSelector = [
    'img[src*="coverartarchive.org"]',
    'span.artwork-image img',
    'a[href*="coverartarchive.org"] img',
  ].join(', ');

  const images = Array.from(new Set(document.querySelectorAll(artworkSelector)));

  for (const img of images) {
    const info = extractMbidInfo(img);
    if (!info) continue;

    const tags = await getTagsForEntity(info.entityType, info.mbid);
    const isNSFW = tags.some(tag => nsfwTags.includes(tag));

    if (isNSFW) {
      img.classList.add('blurredCover');
    }
  }
}

addBlurClass();

window.setTimeout(processCovers, 500);

// ==UserScript==
// @name        MBz Copy URLs and barcode
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/MBz-Copy-URLs.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/MBz-Copy-URLs.user.js
// @match       *://musicbrainz.org/release/*
// @match       *://beta.musicbrainz.org/release/*
// @match       *://musicbrainz.eu/release/*
// @exclude     /\/release\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\/(discids|cover-art|aliases|tags|details|edit|edit-relationships|delete|change-quality|edits|open_edits)/
// @exclude     /\/release\/add/
// @grant       GM_setClipboard
// @grant       GM.setClipboard
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require     https://raw.githubusercontent.com/jpillora/notifyjs/refs/heads/master/dist/notify.js
// @version     1.3
// @author      afro
// @description Adds a button to copy all URL relationships, and makes the barcode field on the sidebar copyable
// ==/UserScript==

// Customize the URL splitter
const urlSplitter = ' '; //splits with white spaces
// Also try the following:
// Comma ', '
// Semicolon '; '
// Double backslash '\\\\'
// New line '\n'

$('head').append(`
  <style>
    .upc-field {
      cursor: pointer;
      color: initial;
    }
    .upc-field:hover {
      color: #a3c6ff;
    }
    .url-copy-button {
      float: right;
      cursor: pointer;
      border: none;
      background: none;
    }
  </style>
`);

async function writeClipboardText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error(error.message);
  }
}

function copyNotif() {
  $.notify('Copied!', {autoHideDelay:'1000', className:'success'});
}

function addURLCopyButton() {
if ($('#bottom-credits').text().search(/purchase for download|download for free|streaming page|stream for free|purchase for mail-order/g) > -1) {
  //icon from https://www.svgrepo.com/svg/535483/link
  const icon = `
    <svg width="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.05025 1.53553C8.03344 0.552348 9.36692 0 10.7574 0C13.6528 0 16 2.34721 16 5.24264C16 6.63308 15.4477 7.96656 14.4645 8.94975L12.4142 11L11 9.58579L13.0503 7.53553C13.6584 6.92742 14 6.10264 14 5.24264C14 3.45178 12.5482 2 10.7574 2C9.89736 2 9.07258 2.34163 8.46447 2.94975L6.41421 5L5 3.58579L7.05025 1.53553Z" fill="#000000"/>
      <path d="M7.53553 13.0503L9.58579 11L11 12.4142L8.94975 14.4645C7.96656 15.4477 6.63308 16 5.24264 16C2.34721 16 0 13.6528 0 10.7574C0 9.36693 0.552347 8.03344 1.53553 7.05025L3.58579 5L5 6.41421L2.94975 8.46447C2.34163 9.07258 2 9.89736 2 10.7574C2 12.5482 3.45178 14 5.24264 14C6.10264 14 6.92742 13.6584 7.53553 13.0503Z" fill="#000000"/>
      <path d="M5.70711 11.7071L11.7071 5.70711L10.2929 4.29289L4.29289 10.2929L5.70711 11.7071Z" fill="#000000"/>
    </svg>
  `;
  let rawURLs = Array.from(document.getElementById('bottom-credits').getElementsByTagName('a')).map(a => a.href);
  let allURLs = [... new Set(rawURLs)]; //deduplicate
  const matchpattern = /musicbrainz|isrchunt.com|pulsewidth.org|kepstin.ca/g;
  let badURLs = allURLs.filter(name => name.match(matchpattern));
  let urlRels = allURLs.filter(x => !badURLs.includes(x)).join(urlSplitter);

  let urlCopyButton = $(`<button title="Copy all URL relationships" class="url-copy-button">${icon}</button>`)
    .on('click', () => {
      writeClipboardText(urlRels);
      copyNotif();
    })
    .appendTo('#bottom-credits > h2');
  }
}
addURLCopyButton();

function copyBarcode() {
  const upcField = $('.barcode')[0];
  if (upcField) { // check if there's a barcode
    upcField.addEventListener('click', () => {
      writeClipboardText(upcField.textContent);
      copyNotif();
    });
    upcField.classList.add('upc-field');
    upcField.title = 'Click to copy';
  }
}
copyBarcode();

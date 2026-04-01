// ==UserScript==
// @name        country list minimizer
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/country-list-minimizer.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/country-list-minimizer.user.js
// @match       *://*musicbrainz.*/*
// @grant       none
// @version     2026.3.31.2
// @author      afro
// @description Auto hides long release event lists and makes them expandable
// @require     https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

// from https://www.freecodecamp.org/news/javascript-debounce-example/
function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}

function addMinimizer() {
  const diffElem = document.querySelectorAll('.release-events-diff');
  if (!diffElem) return;

  for (let elem of diffElem) {
    const headerText = elem.querySelector('th');
    const oldTable = elem.querySelector('.old ul');
    if (!headerText || !oldTable) continue;

    if (headerText.style.textDecoration === 'underline') return;

    const text = document.createElement('li');
    text.style.listStyleType = 'none';

    const listItems = oldTable.querySelectorAll('li');
    let sharedDate = '';

    if (listItems.length > 0) {
      const dates = Array.from(listItems).map(li => li.lastChild?.textContent || '');
      const firstDate = dates[0];
      if (firstDate && dates.every(d => d === firstDate)) {
        sharedDate = firstDate;
      }
    }

    text.innerHTML = sharedDate.length > 0
      ? `${listItems.length} hidden, all on ${sharedDate}`
      : `${listItems.length} hidden.`;

    headerText.style.textDecoration = 'underline';
    headerText.style.cursor = 'pointer';
    headerText.title = 'Click to hide events';

    headerText.addEventListener('click', () => {
      if (oldTable.style.display === 'none') {
        oldTable.style.display = 'block';
        headerText.title = 'Click to hide events';
        if (text) text.remove();
      }
      else {
        oldTable.style.display = 'none';
        oldTable.parentElement.appendChild(text);
        headerText.title = 'Click to show events';
      }
    });
    // auto hide if too many entries
    if (listItems.length > 10) {
      headerText.click();
    }

  }
}

let observer;
let targetNode = ($('#form')[0] || $('#edits')[0] || $('table.edit-release')[0]);

function updateUI() {
  if (observer) observer.disconnect();

  debounce(addMinimizer());

  if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
  }
}

function observePage() {
  if (!targetNode) {
    setTimeout(observePage, 500);
    return;
  }

  observer = new MutationObserver(updateUI);
  updateUI();
}

$(document).ready(observePage);

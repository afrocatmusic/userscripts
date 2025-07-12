// ==UserScript==
// @name        afro's sublinks
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @match       https://musicbrainz.org/*
// @match       https://beta.musicbrainz.org/*
// @match       https://musicbrainz.eu/*
// @grant       none
// @version     0.3
// @author      afro
// @description adds sublinks to MB links
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

//to do: use mutationobserver for dynamically generated links
//eg. MusicBrainz: Expand/collapse release groups
function css() {
  let head = document.getElementsByTagName('head')[0];
  if (head) {
    let style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.textContent = `
    .sublinksContainer {
      width: max-content;
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

      `;
    head.appendChild(style);
    }
}
css();

function generateLinkList(hoveredURL) {
  let links = [];
  const patterns = {
    'artist/': ['/releases','/recordings','/works','/events','/relationships','/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'recording/': ['/fingerprints','/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'release/': ['/discids','/cover-art','/aliases','/tags','/details','/edit','/edit-relationships','/open_edits','/edits'],
    'release-group/': ['/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'work/': ['/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'label/': ['/relationships','/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits']
  };

  for (const type in patterns) {
    if (hoveredURL.includes(type)) {
      links = patterns[type].map(suffix => {
        const li = document.createElement('li');
        const a = document.createElement('a');
          a.href = hoveredURL + suffix;
          a.textContent = suffix.replace('/', '');
        let aTextMap = new Map([
          ['releases','Releases'],
          ['recordings','Recordings'],
          ['works','Works'],
          ['events','Events'],
          ['relationships','Relationships'],
          ['aliases','Aliases'],
          ['tags','Tags'],
          ['ratings','Ratings'],
          ['details','Details'],
          ['edit','Edit'],
          ['edit-relationships','Edit rels.'],
          ['open_edits','Open edits'],
          ['edits','History'],
          ['fingerprints','Fingerprints'],
          ['discids','Disc IDs'],
          ['cover-art','Cover art'],
        ]);
        if(aTextMap.has(a.textContent)) {
          a.textContent = aTextMap.get(suffix.replace('/',''));
        }
          a.target = '_blank';
          li.appendChild(a);
        return li;
      });
      break;
    }
  }
  return links;
}

function createMovableContainer() {
  let sublinksContainer = document.createElement('div');
      $('body')[0].append(sublinksContainer);
      sublinksContainer.setAttribute('class','sublinksContainer');
      sublinksContainer.setAttribute('id','sublinksContainer');
      sublinksContainer.style.display = 'none';

  let list = document.createElement('ul');
      list.setAttribute('id','linkList');
      sublinksContainer.appendChild(list);
}
createMovableContainer();

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

let hoveredObject = null;
function openSublinks() {
  //regex still not perfect
  const regexMatch = /musicbrainz\.org\/(?:artist|recording|release|release-group|work|label)\/(?!.*(?:\/(?:releases|recordings|works|events|relationships|aliases|tags|ratings|details|edit|open_edits|edits|fingerprints|discids|cover-art|create|add))(\/|$))/;
  document.querySelectorAll('a').forEach(link => {
    if (regexMatch.test(link.href)) {
      link.addEventListener('mouseenter', () => {
        hoveredObject = link;
      });
      link.addEventListener('mouseleave', () => {
        hoveredObject = null;
      });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift' && hoveredObject) {
      let container = document.getElementById('sublinksContainer');
      let list = document.getElementById('linkList');
          list.innerHTML = '';
          //hoveredObject.append(container);
          container.style.display = 'block';
          container.style.left = getOffset(hoveredObject).left + 15 + 'px';
          container.style.top = getOffset(hoveredObject).top + 20 + 'px';
      let listItems = generateLinkList(hoveredObject.href);
          listItems.forEach(item => linkList.appendChild(item));
    }
  });
  document.addEventListener('click', (event) => { //close div if click outside
    if (!event.target.closest('.sublinksContainer')) {
      document.getElementById('sublinksContainer').style.display = 'none';
      let linkList = $('#linkList');
          linkList.empty();
    }
  })
}

window.setTimeout(openSublinks, 50);

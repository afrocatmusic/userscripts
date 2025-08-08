// ==UserScript==
// @name        afro's sublinks
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/afros-sublinks.user.js
// @match       https://musicbrainz.org/*
// @match       https://beta.musicbrainz.org/*
// @match       https://musicbrainz.eu/*
// @grant       none
// @version     0.6
// @author      afro
// @description Mouse over a MB entity link and press shift to open a menu with useful shortcuts
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==
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
      `;
    head.appendChild(style);
    }
}
css();
function addSublinksLogo() {
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
    tooltipDiv.textContent = "afro's sublinks is active\nHover over a link and press shift!";
  document.body.appendChild(tooltipDiv)
  svgContainer.addEventListener('mouseover', (event) => {
    tooltipDiv.classList.add('visible');
  });
  svgContainer.addEventListener('mousemove', (event) => {
    const offsetX = -170;
    const offsetY = -20;
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
    'artist/': ['/releases','/recordings','/works','/events','/relationships','/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'recording/': ['/fingerprints','/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'release/': ['/discids','/cover-art','/aliases','/tags','/details','/edit','/edit-relationships','/open_edits','/edits'],
    'release-group/': ['/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'work/': ['/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits'],
    'area/': ['/artists','/events','/labels','/releases','/recordings','/places','/users','/works','/aliases','/tags','/details','/open_edits','/edits'],
    'url/': ['/edit','/open_edits','/edits'],
    'label/': ['/relationships','/aliases','/tags','/ratings','/details','/edit','/open_edits','/edits']
  };

  for (const entity in patterns) {
    if (hoveredURL.includes(entity)) {
      links = patterns[entity].map(suffix => {
        const li = document.createElement('li');
        const a = document.createElement('a');
          a.href = hoveredURL + suffix;
          a.textContent = suffix.replace('/', '');
        let aTextMap = new Map([ //name of menu options
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
          ['area','Area'],
          ['cover-art','Cover art'],
          ['artists','Artists'],
          ['labels','Labels'],
          ['places','Places'],
          ['users','Users'],
        ]);
        if(aTextMap.has(a.textContent)) {
          a.textContent = aTextMap.get(suffix.replace('/',''));
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

let hoveredObject = null;
let processedLinks = new Set();
let mouseX = 0;
let mouseY = 0;
function openSublinks() {
  const regexMatch = /musicbrainz\.(org|eu)\/(?:artist|recording|release|release-group|work|label|area|url)\/(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})($|\/)$/;
  document.querySelectorAll('a').forEach(link => {
    if (regexMatch.test(link.href) && !processedLinks.has(link)) {
      processedLinks.add(link);
      link.addEventListener('mouseenter', (e) => {
          hoveredObject = link;
          mouseX = e.pageX;
          mouseY = e.pageY;
        function updateMousePos(event) {
          mouseX = event.pageX;
          mouseY = event.pageY;
        }
        link.addEventListener('mousemove', updateMousePos);
        link.addEventListener('mouseleave', () => {
          hoveredObject = null;
          link.removeEventListener('mousemove', updateMousePos);
        }, {once: true});
      });
    }
  });
}
openSublinks();
// --- global listeners ---
document.addEventListener('keydown', (event) => {
  if (event.key === 'Shift' && hoveredObject) {
    let container = document.getElementById('sublinksContainer');
    let list = document.getElementById('linkList');
        list.innerHTML = '';
        container.style.display = 'block';
        container.style.left = mouseX + 10 + 'px';
        container.style.top = mouseY + 10 + 'px';
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
});
// --- mutation observer
const targetNode = $('#page')[0];
const config = {childList: true, subtree: true};
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.tagName === 'A' || node.querySelectorAll('a').length > 0) {
            openSublinks();
          }
        }
      });
    }
  }
}
const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);

// ==UserScript==
// @name        MBz Blur NSFW cover art
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/MBz-Blur-NSFW-cover-art.user.js
// @match       *://musicbrainz.*/release*
// @match       *://beta.musicbrainz.*/release*
// @grant       none
// @version     1.0
// @author      afro
// @description Blurs NSFW cover art if it's tagged as such
// ==/UserScript==

function blurImg(){
var img = document.querySelector('span.artwork-image > img:nth-child(1)');
var nsfwTags = ['nsfw cover art', 'nude cover', 'boobs on cover', 'pornogrind', 'grindcore', 'goregrind', 'deathgrind', 'brutal death metal', 'powerviolence', 'hentai', 'nsfw', 'nsfw cover', 'porn cover', 'gore cover', 'gore on cover', 'gore in cover', 'gore'];
var tagList = Array.from(document.querySelectorAll('.sidebar-tags a[href^="/tag/"]'), (element) => element.textContent);
var isNSFW = tagList.some(r=> nsfwTags.includes(r));

  if (isNSFW === true){
      img.style.filter = 'blur(25px)';
      img.style.clipPath = 'inset(0px 0px 0px 0px)';
  }
}

window.setTimeout(blurImg, 100);

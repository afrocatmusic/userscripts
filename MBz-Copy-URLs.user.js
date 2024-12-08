// ==UserScript==
// @name        MBz Copy URLs
// @namespace   https://github.com/afrocatmusic/userscripts
// @updateURL   https://raw.github.com/afrocatmusic/userscripts/main/MBz-Copy-URLs.user.js
// @downloadURL https://raw.github.com/afrocatmusic/userscripts/main/MBz-Copy-URLs.user.js
// @match       *://musicbrainz.*/release/*
// @match       *://beta.musicbrainz.*/release/*
// @grant       GM_setClipboard
// @grant       GM.setClipboard
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @version     1.0
// @author      afro
// @description adds a button to copy all URL relationships
// ==/UserScript==

function addURLCopyButton(){

//---SETTINGS---//
//set how to split the URLs, replace the text in between the '' in the splitter variable
//' ' = blank spaces
//'\n' = line breaks
//'\\\\' = useful for creating multivalue fields in mp3tag
//'; ' = useful for creating multivalue fields in foobar2000
var splitter = ' '
//---SETTINGS---//

//there's probably a better way to do this than filtering an array over and over...
var rawurl = Array.from(document.getElementById('bottom-credits').getElementsByTagName('a')); //gets array with all html links in bottom credits section
var allurl = rawurl.toString().replaceAll(',',' ').split(' '); //gets links only
var matchpattern = 'musicbrainz'
var dupedurls = allurl.filter(function (str) { return str.indexOf(matchpattern) === -1; }); //removes any musicbrainz links, and Harmony
var isrchunt = 'isrchunt'
var dupedurls = dupedurls.filter(function (str) { return str.indexOf(isrchunt) === -1; }); //removes isrchunt link
var arrayurl = dupedurls.filter((item, index) => dupedurls.indexOf(item) === index); //removes duplicates
var url = arrayurl.toString().replaceAll(',',splitter);

let urlCopyButton = document.createElement("button");
  urlCopyButton.innerText = 'Copy All URLs';
  urlCopyButton.style.cssFloat = 'right';
  urlCopyButton.title = url;

  urlCopyButton.addEventListener("click", () => writeClipboardText(url));

    async function writeClipboardText(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error(error.message);
      }
    }

let div = document.querySelector('#bottom-credits > h2');
  div.appendChild(urlCopyButton);
}

window.setTimeout(addURLCopyButton, 50);

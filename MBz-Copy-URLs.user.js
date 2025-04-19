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
// @version     1.2
// @author      afro
// @description Adds a button to copy all URL relationships, and barcodes can be copied in one click
// ==/UserScript==

function addURLCopyButton(){
if (document.getElementById('bottom-credits') === null) { //check if there's any URLs to copy
  return;
} else {
        //---SETTINGS---//
        //set how to split the URLs, replace the text in between the '' in the splitter variable
        //' ' = blank spaces
        //'\n' = line breaks
        //'\\\\' = useful for creating multivalue fields in mp3tag
        //'; ' = useful for creating multivalue fields in foobar2000
        var splitter = ' '
        //---SETTINGS---//

        var rawURLs = Array.from(document.getElementById('bottom-credits').getElementsByTagName('a')).toString().split(',');
        var allURLs = rawURLs.filter((item, index) => rawURLs.indexOf(item) === index);
        var matchpattern = /musicbrainz|isrchunt.com|pulsewidth.org|kepstin.ca/g
        //if the array has anything that matches these^ the item gets removed
        var badURLs = allURLs.filter(name => name.match(matchpattern));
        var url = allURLs.filter(x => !badURLs.includes(x)).toString().replaceAll(',',splitter);

        let urlCopyButton = document.createElement("button");
            urlCopyButton.innerText = 'Copy URLs';
            urlCopyButton.title = url;
            urlCopyButton.style.cssFloat = 'right';
            urlCopyButton.style.cursor = 'pointer';
            urlCopyButton.addEventListener("click", () => writeClipboardText(url));
              async function writeClipboardText(text) {
                try {
                  await navigator.clipboard.writeText(text);
                } catch (error) {
                  console.error(error.message);
                }
              }

            urlCopyButton.addEventListener("click", () => urlCopyNotif());
              function urlCopyNotif() {
                $(urlCopyButton).notify('Copied!',{ position:'left',
                                                    autoHideDelay:400,
                                                    className:'success',
                                                    showDuration:1,
                                                    hideDuration:50,
                                                    arrowShow:false });
              }

        let div = document.querySelector('#bottom-credits > h2'); //where to put it
            div.appendChild(urlCopyButton);

        return;
        }
}

function copyBarcode(){
if (document.querySelector('.barcode') === null) { //check if the barcode field exists
  return;
} else {
        var upc = document.querySelector('.barcode').innerText; //this is the barcode number
        var upcField = document.querySelector('.barcode'); //this is where the barcode is
        var upcAnchor = document.createElement('barcodeAnchor'); //this is what we replace with

        upcAnchor.textContent = upc;
        upcAnchor.title = 'Click to copy';
        upcAnchor.addEventListener("click", () => writeClipboardText(upc));
                      async function writeClipboardText(text) {
                          try {
                            await navigator.clipboard.writeText(text);
                          } catch (error) {
                            console.error(error.message);
                          }
                        }
        upcField.innerText = '';
        upcField.appendChild(upcAnchor);
        upcField.addEventListener("click", () => barcodeCopyNotif());
                      function barcodeCopyNotif() {
                        $.notify('Copied!',{ autoHideDelay:'1500', className:'success' });
                      }
        upcField.style.cursor = 'pointer';
        //upcField.style.textDecoration = 'underline';

        upcField.onmouseover = function() {mouseOver()};
        upcField.onmouseout = function() {mouseOut()};
                      function mouseOver() {
                        upcField.style.color = "#a3c6ff";
                      }

                      function mouseOut() {
                        upcField.style.color = "initial";
                      }
        return;
        }
}

window.setTimeout(copyBarcode, 50);
window.setTimeout(addURLCopyButton, 50);

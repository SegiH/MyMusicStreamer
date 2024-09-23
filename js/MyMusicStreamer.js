// FEATURES TO ADD
//
// auto shuffle playlist option
// keyboard shortcut in filetree. W goes to w in file tree
// song stats'

// THINGS TO FIX
//
// Fix add tracks to new playlist and save
// Need to implement remove song from existing playlist. maybe see if stored on server is extra step needed
// when saving playlist, do something about ' or " in file name
// when you play a song from file tree and it ends, make sure next song in file tree plays even when a playlist is loaded

// THINGS TO FIX THAT ARE LOWER PRIORITY
//
// In adjustWidth(), make tab and playlist shrink and expand as needed
// in adjustWidth() make sure css menu gets moved over
// fix reordering playlist using KB shortcut. also fix how to select an item
// see if you can replace the css playlist menu with something else
// Fix non-standard ascii characters - replace n with tilde to n

// MAY NOT BE BUGS ANYMORE - VERIFY
// on mobile, songs sometimes don't auto play or play at all
// on android, song keeps restarting if you press on stop. May be limited to my android app
// see if I can use unaccent in php connect otherwise delete it 

const autoShuffle = true; // This is currently for me only and is used to determine if I want to auto shuffle one of my playlists.

// *** DO NOT CHANGE ANYTHING BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING ***

// THE VALUE SHOULD BE "\\" IF THE SERVER RUNS WINDOWS OR "/" FOR LINUX/UNIX/MACS

let activeTab = 0;

let delimiter = "";

let playlists = []

let currentMMSPlaylist, mmsQueue, myPlaylist, recentPlaylist; // Playlist objects for current playlist and recently added songs

let isAddingAllTracks = false; // Flag to monitor when adding all tracks

let currPlaylistItem = -1; // This is only used to store the index of the currently selected item in the playlist when reordering

let currBrowser; // Stores the current browser

let isReorderingPlaylist = false; // Flag to indicate whether a playlist is being reordered. Used for keyboard shortcuts

let isMobileDevice = false;

// Domain path is the full URL to the music folder
const domain_path = document.URL.substring(0, document.URL.lastIndexOf("/")) + '/Music/';

let music_path = "";

let playlistChanged = false; // Whenever a playlist is modified, this flag is set to true so the user can be prompted to save it

// object to detect various browsers
const BrowserDetect = {
     init: function () {
          "use strict";

          this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
          this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
          this.OS = this.searchString(this.dataOS) || "an unknown OS";
     },
     searchString: function (data) {
          "use strict";
          let dataString, dataProp;

          for (let i = 0; i < data.length; i = i + 1) {
               dataString = data[i].string;
               dataProp = data[i].prop;
               this.versionSearchString = data[i].versionSearch || data[i].identity;

               if (dataString) {
                    if (dataString.indexOf(data[i].subString) !== -1) {
                         return data[i].identity;
                    }
               } else if (dataProp) {
                    return data[i].identity;
               }
          }

          return null;
     },
     searchVersion: function (dataString) {
          "use strict";
          const index = dataString.indexOf(this.versionSearchString);

          if (index === -1) {
               return;
          }

          return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
     },
     dataBrowser: [
          {
               string: navigator.userAgent,
               subString: "Chrome",
               identity: "Chrome"
          },
          {
               string: navigator.userAgent,
               subString: "OmniWeb",
               versionSearch: "OmniWeb/",
               identity: "OmniWeb"
          },
          {
               string: navigator.vendor,
               subString: "Apple",
               identity: "Safari",
               versionSearch: "Version"
          },
          {
               prop: window.opera,
               identity: "Opera",
               versionSearch: "Version"
          },
          {
               string: navigator.vendor,
               subString: "iCab",
               identity: "iCab"
          },
          {
               string: navigator.vendor,
               subString: "KDE",
               identity: "Konqueror"
          },
          {
               string: navigator.userAgent,
               subString: "Firefox",
               identity: "Firefox"
          },
          {
               string: navigator.vendor,
               subString: "Camino",
               identity: "Camino"
          },
          {		// for newer Netscapes (6+)
               string: navigator.userAgent,
               subString: "Netscape",
               identity: "Netscape"
          },
          {
               string: navigator.userAgent,
               subString: "MSIE",
               identity: "Internet Explorer",
               versionSearch: "MSIE"
          },
          {
               string: navigator.userAgent,
               subString: "Gecko",
               identity: "Mozilla",
               versionSearch: "rv"
          },
          { 		// for older Netscapes (4-)
               string: navigator.userAgent,
               subString: "Mozilla",
               identity: "Netscape",
               versionSearch: "Mozilla"
          }
     ],
     dataOS: [
          {
               string: navigator.platform,
               subString: "Win",
               identity: "Windows"
          },
          {
               string: navigator.platform,
               subString: "Mac",
               identity: "Mac"
          },
          {
               string: navigator.userAgent,
               subString: "iPhone",
               identity: "iPhone/iPod"
          },
          {
               string: navigator.platform,
               subString: "Linux arm",
               identity: "Android"
          },
          {
               string: navigator.platform,
               subString: "Linux",
               identity: "Linux"
          },
          {
               string: navigator.platform,
               subString: "Unix",
               identity: "Unix"
          }
     ]
};

BrowserDetect.init();

// Initialize the jPlayer playlist
const cssSelector = { jPlayer: '#jquery_jplayer_1', cssSelectorAncestor: '#jp_container_1' };
const recentCssSelector = { jPlayer: '#jquery_jplayer_2', cssSelectorAncestor: '#jp_container_2' };
const playlist = []; // Empty playlist
const options = { swfPath: '/js/jplayer', supplied: 'ogv, m4v, oga, mp3' };
myPlaylist = new jPlayerPlaylist(cssSelector, playlist, options);

// Set the animation when removing a track or shuffling to none
myPlaylist.option('removeTime', '0');
myPlaylist.option('shuffleTime', '0');

// This adds an 'x' to the track so it can be removed
myPlaylist.option('enableRemoveControls', true);

// Adjust displayTime
myPlaylist.option('displayTime', 'fast');

// Replace all occurrence of a character in a string since the native JS function only replaces the first instance
String.prototype.replaceAll = function (find, replace) {
     let str = this;

     // You cant replace a character of a JS string by doing mystr[0]="a" so this prototype does it for you
     String.prototype.replaceCharAt = function (index, character) {
          return this.substr(0, index) + character + this.substr(index + character.length);
     }

     for (let i = 0; i < str.length; i++) {
          if (str[i] == find) {
               str = str.replaceCharAt(i, replace);
          }
     }

     return str;
};

// Add a track to the current playlist
function addToCurrentPlaylist(track_name, track_path) {
     "use strict";

     // Modify the playlist css to make it visible
     $('.jp-playlist').css('left', '15px');
     $('.jp-playlist').css('top', '100px');

     $('.jp-playlist').fadeIn("fast");

     // if the track name is not empty    
     if ($.trim(track_name) !== "") {
          // Check to see if the track is already in the playlist
          if (findTrackInPlaylist(track_name) === true) {
               if (confirm("The track " + track_name + " is already in the playlist. If you do not want to add it, choose cancel.") === false) {
                    return false;
               }
          }

          // Add the track to the playlist
          myPlaylist.add({ title: track_name, mp3: track_path });

          // Show the save option in the playlist menu
          $('#savePlaylist').css('display', 'block');

          // make the x to remove the item from the playlist float on the right instead of on the left which is the default
          $('.jp-playlist-item-remove').css('float', 'right');

          //  Tell jPlayer to play the song if no song is currently playing
          if ($('#jquery_jplayer_1').data('jPlayer').status.currentTime === 0 && isAddingAllTracks === false) {
               $('#jquery_jplayer_1').jPlayer('setMedia', { mp3: track_path }).jPlayer('play');

               const currentSong = $('.jp-playlist li').eq(myPlaylist.current).find('.jp-playlist-item').html();

               // Update the tag for the currently playing song
               setCurrentlyPlaying(currentSong);
          }

          // make sure the playlist height matches the tab controls' height
          // Commented out on 09-06-24. Doesn't look nice
          //adjustPlaylistHeight();
     }
}

// Increase the font size of the list tree items - This is called when on mobile devices to make it easier to select an item
function adjustFileTreeItems() {
     "use strict";

     /*if ( $('.fileTreeCSS li') == undefined ) {
     alert("yes");
     }*/
     /*
     setTimeout(function () {
          // Increase the size of items on a mobile device
          $('.fileTreeCSS li a').css('font-size','xx-large');
          $('.fileTreeCSS li a').css('height','30px');
     }, 1000);*/

}

// adjust the playlist height so that the 2nd tab height matches the first one
function adjustPlaylistHeight() {
     "use strict";

     // make sure both tabs have the same height which they do not by default
     if ($('#tabs-1').css('height') !== $('#tabs-2').css('height')) {
          setTimeout(function () {
               $('#tabs-2').css('height', $('#tabs-1').css('height'));
          }, 100);

     }

     /*if ($('#tabs-1').css('height') !== $('#tabs-4').css('height')) {
          setTimeout(function () {
               $('#tabs-4').css('height', $('#tabs-1').css('height'));
               $('#tabs-4').css('display', 'block');
          }, 100);
     }*/
}

// adjust the file tree width as needed
function adjustWidth() {
     "use strict";

     let adjustment = 200; // The amount to widen the file tree to make it wider on desktops

     // Store the width of the music browser tab. Use getRelativeValue() to get width of #tabs as a number  
     let i, maxLength = 0, tabWidth = getRelativeValue('#tabs', 'width', null, true);

     // Make sure none of the tracks exceed this allow length
     for (i = 0; i < $('#jqueryFileTree li').length; i += 1) {
          if ($('#jqueryFileTree li').eq(i).text().length > maxLength) {
               maxLength = $('#jqueryFileTree li').eq(i).text().length;
          }
     }

     // if the code above didn't assign a value to maxlength, it could be because the file tree hasn't loaded yet and doesnt have any list items
     /*if (maxLength === 0) {
          setTimeout(adjustWidth, 100);
     }*/

     if (maxLength * 10 > tabWidth) {
          $('#tabs').css('width', (maxLength * 10) + 'px');
     }

     setTimeout(function () {
          if (isMobileDevice === false) {
               // Make the file tree wider on Desktops
               //$('#tabs').css('width', getRelativeValue('#tabs', 'width', adjustment));

               adjustment = 0;

               // This makes jPlayer centered above $('#tabs') after it has been widened
               $('div.jp-interface').css('left', parseFloat($('#tabs').css('width')) / 2 - parseFloat($('div.jp-interface').css('width')) / 2 + 'px');

               // Align the css menu with the top of the tabbed control
               $('.pureCssMenu').css('top', $('#tabs').css('top'));
               $('.pureCssMenu').css('left', getRelativeValue('#tabs', 'width', 10));
          }

          // Set the file tree width to 15 less than the width of #tabs so that it fits perfectly inside of the tab 
          $('#myMusicStreamer_fileTree').css('width', getRelativeValue('#tabs', 'width', -15));

          $('#myMusicStreamer_fileTree').fadeIn("slow");
     }, 1000);
}

// Case insensitive sort an array of strings
function caseInsensitiveSort(a, b) {
     "use strict";

     let ret = 0;
     a = a?.toLowerCase();
     b = b?.toLowerCase();

     if (a > b) {
          ret = 1;
     }

     if (a < b) {
          ret = -1;
     }

     return ret;
}

// Change the current path of the jQueryFileTree to the one specified
function changeFileTreePath(newPath) {
     "use strict";

     $('#myMusicStreamer_fileTree').fileTree({
          root: newPath,
          script: 'js/jqueryFileTree/connectors/jqueryFileTree.php',
          expandSpeed: -1,
          collapseSpeed: -1
     },
          function (file) {
               file_selected(file);
          },
          function (dire) {
               dir_selected(dire.attr('rel'));
          });
}

// Convert URL of a track to a full path on the server side. This is needed for jQueryFileTree which only understands paths to files not URLs.
function convertUrlToPath(currURL) {
     "use strict";

     // Get everything after Music/ in currpath
     currURL = currURL.substring(currURL.indexOf('Music/') + 6);

     // Append the music_path to the beginning
     currURL = music_path + currURL;

     return currURL;
}

// Create the tag that appears in the playlist (Artist - Album - Song Name). Assumes that the songs are stored in the Music folder
// in the format Music/Artist Name/Album Name/01 Track Name
function createPlaylistTag(trackPath) {
     "use strict";

     // since we are referring to a URL path, always use /
     let albumName, artistName, lastSlash, previousSlash, previousPreviousSlash, songName, spaceIndex, trackNum;

     // Find the last slash in trackPath
     lastSlash = trackPath.lastIndexOf("/");

     // Find last occurrence of slash in the path before lastSlash
     previousSlash = trackPath.lastIndexOf("/", lastSlash - 1);

     // Find last occurrence of slash before value of previousSlash
     previousPreviousSlash = trackPath.lastIndexOf("/", previousSlash - 1);

     // Isolate song name
     songName = trackPath.substring(lastSlash + 1);

     // Isolate album name 
     albumName = trackPath.substring(previousSlash + 1, lastSlash);

     // Parse trackPath for Artist name.
     artistName = trackPath.substring(previousPreviousSlash + 1, previousSlash);

     // Get the index of the first space in songName
     spaceIndex = songName.indexOf(String.fromCharCode('0x20'));

     // If a space was found
     if (spaceIndex !== -1) {
          // Get everything before the space
          trackNum = songName.substring(0, spaceIndex - 1);

          // If it is a proper numer remove it
          if (trackNum.isNumber() === true) {
               songName = songName.substring(spaceIndex + 1);

               // If the song is in the format "01 - song name" instead of "01 - song name", strip out the "- "
               if (songName.substring(0, 1) === "-") {
                    // Remove the first character
                    songName = songName.substring(1);
               }
          }
     }

     // Remove leading and ending whitespace
     songName = $.trim(songName);

     // If the 4th to last character is a dot, remove the file extension
     if (songName.substring(songName.length - 4, songName.length - 3) === '.') {
          songName = songName.substring(0, songName.length - 4);
     }

     // Use artist or album name in the songs' tag unless it is empty or equal to "Music"
     return (artistName !== "" && artistName !== "Music" ? artistName + " - " : "") + (albumName !== "" && albumName !== "Music" ? albumName + " - " : "") + songName;
}

// Callback when the user clicks on a directory in the file tree
function dir_selected(dire) {
     "use strict";

     let tmp = "";

     // Clear the contents of the file tree
     $('#myMusicStreamer_fileTree li').remove();

     // Erase the contents of the jump-to text field
     $('#jump-to').attr('value', '');

     // Do not use dire.substring(-3) because in IE it will return the whole string

     //  If the last the characters of the selected are ../, move up 1 directory
     if (dire.substring(dire.length - 3) === ('..' + delimiter)) {
          //  Strip out ../ from the end of dire
          tmp = dire.substring(0, dire.length - 3); // remove ../ at end of dire

          //  Make sure the user isn't trying to move below the root directory of the music folder
          if (tmp !== music_path) {

               //  Strip the last slash at the end
               tmp = tmp.substring(0, tmp.length - 1);

               //  Store everything up to the last slash in tmp (to move up 1 directory) and store it in tmp
               tmp = tmp.substring(0, tmp.lastIndexOf(delimiter));

               //  Add the slash at the end
               tmp = tmp + delimiter;
          }
     } else {
          //  If the last 3 characters aren't ../, store the directory named that the user clicked on
          tmp = dire;
     }

     // Tell jQuery file tree to change to the new directory
     changeFileTreePath(tmp);

     if (isMobileDevice === true) {
          adjustFileTreeItems();
     }

     // Set the tag that displays the current path of the file tree
     $('div#currentPath').html(tmp.substring(music_path.length));
}

// Callback when the user clicks on a file in the file tree
function file_selected(file) {
     "use strict";

     if (typeof (file) === 'undefined') {
          return true;
     }

     // When reordering is happening, do not process a file being clicked
     if (isReorderingPlaylist === true) {
          alert("Reordering mode is turned on. You cannot add any files to the current playlist while reordering");
          return;
     }

     setTimeout(function () {
          // Unset the playing tag because otherwise it will show 00:01 or 01:40     
          $('div.jp-duration').html("00:00");
     }, 500);

     setCurrentlyPlaying(createPlaylistTag(file));

     setTimeout(function () {
          // tell jPlayer to play the new track and convert file from a file path to a URL
          $('#jquery_jplayer_1').jPlayer('setMedia', { mp3: domain_path + file.substring(file.indexOf(music_path) + music_path.length).replaceAll(delimiter, "/") }).jPlayer('play'); // play song
     }, 1000);

     // Use exact song name for tag when you click on it in the file tree 
     let newtag = file.substring(file.lastIndexOf(delimiter) + 1);

     // Remove the file extension
     newtag = newtag.substring(0, newtag.length - 4);

     // loop through all items in FileTree and find the track that is currently playing
     for (let i = 0; i < $('#jqueryFileTree li').length; i++) {
          // track name of the current item in for loop
          let currtag = $('#jqueryFileTree li').eq(i).text();

          if (currtag === "..") {
               continue
          }

          // The track name ends in add because of the "add" link. This removes it
          if (currtag.slice(-3) === "add") {
               currtag = currtag.substring(0, currtag.length - 3);
          }

          // Strip the new line character at the the end of the string if it is there because it will cause problems if we don't
          if (currtag.charCodeAt(currtag.length - 1) === 10) {
               currtag = currtag.substring(0, currtag.length - 1);
          }

          // If the 4th to last character is a dot, remove the file extension
          if (currtag.substring(currtag.length - 4, currtag.length - 3) === '.') {
               currtag = currtag.substring(0, currtag.length - 4);
          }

          if (currtag == newtag) {
               // Get the Full URL of the current song
               let base = domain_path + file.substring(file.indexOf(music_path) + music_path.length).replaceAll(delimiter, "/");

               // remove everything after the last slash - This is a URL so always use /
               base = base.substring(0, base.lastIndexOf("/") + 1);

               const mms_queue = new Array();

               // Remove all items from the queue tab
               $('.queue-item').remove();

               for (let j = i; j < $('#jqueryFileTree li').length; j++) {
                    if (currtag === "..") {
                         continue
                    }

                    currtag = $('#jqueryFileTree li').eq(j).text();

                    // The track name ends in add because of the "add" link. This removes it
                    if (currtag.slice(-3) === "add") {
                         currtag = currtag.substring(0, currtag.length - 3);
                    }

                    // Strip the new line character at the the end of the string if it is there because it will cause problems if we don't
                    if (currtag.charCodeAt(currtag.length - 1) === 10) {
                         currtag = currtag.substring(0, currtag.length - 1);
                    }

                    mms_queue.push(base + currtag);

                    const linkHTML = "<div><A class='queue-item' HREF='javascript:;' style='text-decoration:none; font-size:16px;" + (j == i ? "color:red;" : "") + "'>" + createPlaylistTag(currtag) + "</A></div>";
                    $('#tabs-4').append(linkHTML);
               }

               mmsQueue = JSON.stringify(mms_queue);
          }
     }
}

// search the current playlist for the track name that is going to be added
function findTrackInPlaylist(trackName) {
     "use strict";

     for (let counter = 0; counter < myPlaylist.playlist.length; counter += 1) {
          if (myPlaylist.playlist[counter].title === trackName) {
               return true;
          }
     }

     return false;
}

// read list of recently added files and add to the recently added tab
async function generateRecentlyAdded(recentDuration) {
     try {
          const data = { duration: recentDuration, currpath: music_path };

          const result = await fetch(`php/getRecentFiles.php?data=${JSON.stringify(data)}`, {});

          const recentFilesJSON = await result.json();

          $('.recentArtist').remove(); // Remove all previously added artist

          if (recentFilesJSON !== undefined) {
               Object.keys(recentFilesJSON).forEach(function (element, index, array) {
                    // Ignore . and .. folders
                    if (recentFilesJSON[element] != null && recentFilesJSON[element] != "." && recentFilesJSON[element] != ".." && (recentFilesJSON[element].slice(0, 1) != "." || (recentFilesJSON[element].slice(0, 1) == "." && recentFilesJSON[element].slice(1, 2) == "."))) {
                         const linkHTML = "<div class='recentArtist'><A HREF='javascript:;' style='text-decoration:none; font-size:16px'><IMG SRC='js/jqueryFileTree/images/directory.png'> " + recentFilesJSON[element] + "</A></div>";
                         $('#tabs-3').append(linkHTML);
                    }
               });
          }
     } catch (e) {
          console.log(`An error occurred getting the recently added with duration ${duration}`);
     }
}

// Get the music_path from the server
async function getMusicPath() {
     "use strict";

     try {
          const result = await fetch(`php/getMusicPath.php`, {});

          const musicPathJSON = await result.json();

          music_path = musicPathJSON[0].MusicPath.toString();

          if (music_path.substring(0, 1) == "/") {
               delimiter = "/";
          } else {
               delimiter = "\\";
          }
     } catch (e) {
          alert('There was an error getting the music path with the error', error);
     }
}

// get the next item from the queue
function getNextQueue(currTrack) {
     if (mmsQueue === null || (mmsQueue !== null && mmsQueue === "[]")) {
          return;
     }

     // parse it
     queue = JSON.parse(mmsQueue);

     // find current track in queue
     for (let i = 0; i < queue.length; i++) {
          if (queue[i] == currTrack || createPlaylistTag(queue[i]) == currTrack) {
               // When i+1 = last track it means the user actually clicked on the 1st item since index 0-1 = last item. Set to -1 so the first track at index 0 gets played.
               /*if (i + 1 == queue.length) {
                         i = -1;
                    }*/

               if (i + 1 < queue.length) {
                    // next track is the same as the current one
                    if (createPlaylistTag(currTrack) === createPlaylistTag(queue[i + 1])) {
                         // clear tag for next song
                         setCurrentlyPlaying("");

                         // mark the song as black in the queue tab
                         $('.queue-item').each(function () {
                              $(this).css('color', 'black');
                         });

                         return;
                    }

                    // set tag for next song
                    setCurrentlyPlaying(createPlaylistTag(queue[i + 1]));

                    // tell jPlayer to play the new track
                    $('#jquery_jplayer_1').jPlayer('setMedia', { mp3: queue[i + 1] }).jPlayer('play'); // play song

                    // mark the song as red in the queue tab
                    $('.queue-item').each(function () {
                         if (createPlaylistTag(queue[i + 1]) == $(this).text()) {
                              $(this).css('color', 'red');
                         } else {
                              $(this).css('color', 'black');
                         }
                    });

                    return;
               }
          }
     }
}

// Get the relative value in pixels relative to an element
function getRelativeValue(element, property, adjustment, asnumber) {
     "use strict";

     asnumber = (asnumber === true ? true : false);

     return parseFloat($(element).css(property).substring(0, $(element).css(property).indexOf('px'))) + adjustment + (asnumber === false ? 'px' : null);
}

// Hide the playlist
function hidePlaylist() {
     "use strict";

     // Use jQuery animations to hide the playlist    
     $('.jp-playlist').fadeOut("slow");

     // Hide the Save this playlist menu option
     $('#savePlaylist').css('display', 'none');
}

// Move an item in the playlist at index "from" to the index "to"
function movePlaylistItem(from, to) {
     "use strict";

     let currTitle, currURL;

     // Save the title and path to the mp3 of the item that is going to be overwritten
     currTitle = myPlaylist.playlist[to].title;
     currURL = myPlaylist.playlist[to].mp3;

     // Alter the jQuery playlist text
     // These jQuery statements alters the playlist text
     $('.jp-playlist li').eq(to).find('.jp-playlist-item').text($('.jp-playlist li').eq(from).find('.jp-playlist-item').text());
     $('.jp-playlist li').eq(from).find('.jp-playlist-item').text(currTitle);

     // Modify the myPlaylist object to reflect the swap.
     myPlaylist.playlist[to].title = myPlaylist.playlist[from].title;
     myPlaylist.playlist[to].mp3 = myPlaylist.playlist[from].mp3;

     myPlaylist.playlist[from].title = currTitle;
     myPlaylist.playlist[from].mp3 = currURL;

     // Fix the radio buttons
     $('#item' + from + '').css('top', $('.jp-playlist li').eq(from).find('.jp-playlist-item').prop('offsetTop') + 'px');
     $('#item' + to + '').css('top', $('.jp-playlist li').eq(to).find('.jp-playlist-item').prop('offsetTop') + 'px');

     // Select the radio button that was just moved
     $('#item' + (to) + '').attr('checked', 'checked');

     // set new index of currPlaylistItem
     currPlaylistItem = to;

     // select the new item
     myPlaylist.select(currPlaylistItem);
}

// This function will play either the current, next or previous track depending on the value of which
// When which=0, play currently selected song, when it is 1, play previous track, 2 play next track
function playTrack(which, currtrack) {
     "use strict";

     let basepath, currpath, currtag, newtag, newtrack, nexttrack, previoustrack;

     // loop through all items in FileTree and find the track that is currently playing, skipping item 0 (..)
     for (let i = 1; i < $('#jqueryFileTree li').length; i += 1) {

          // track name of the current item in for loop
          currtag = $('#jqueryFileTree li').eq(i).text();

          // The track name ends in add because of the "add" link. This removes it
          if (currtag.slice(-3) === "add") {
               currtag = currtag.substring(0, currtag.length - 3);
          }

          // Strip the new line character at the the end of the string if it is there because it will cause problems if we don't
          if (currtag.charCodeAt(currtag.length - 1) === 10) {
               currtag = currtag.substring(0, currtag.length - 1);
          }

          nexttrack = '';
          previoustrack = '';

          // If the track matches the currently playing track
          if (currtag === currtrack) { // We don't need to do anything when which = 0 since currtrack is already set above
               if (which === 1) { // previous track
                    // Validate that i is within range of 1 - last item (item 0 is ..) 
                    if (i - 1 > 0) {
                         // Store previous track name
                         previoustrack = $('#jqueryFileTree li').eq(i - 1).text();

                         // The track name ends in add because of the "add" link. This removes it
                         if (previoustrack.slice(-3) === "add") {
                              previoustrack = previoustrack.substring(0, previoustrack.length - 3);
                         }

                         // Strip the new line character at the the end of the string if it is there
                         if (previoustrack.charCodeAt(previoustrack.length - 1) === 10) {
                              previoustrack = previoustrack.substring(0, previoustrack.length - 1);
                         }
                    }
               } else if (which === 2) { // next track
                    // Validate that $('#jqueryFileTree li').eq(i+1).text() (next item) is valid
                    if ((i + 1) < $('#jqueryFileTree li').length) {

                         // Store next track name 
                         nexttrack = $('#jqueryFileTree li').eq(i + 1).text();

                         // The track name ends in add because of the "add" link. This removes it
                         if (nexttrack.slice(-3) === "add") {
                              nexttrack = nexttrack.substring(0, nexttrack.length - 3);
                         }

                         // Strip the new line character at the the end of the string if it is there
                         if (nexttrack.charCodeAt(nexttrack.length - 1) === 10) {
                              nexttrack = nexttrack.substring(0, nexttrack.length - 1);
                         }
                    }
               }
          }

          // Make sure that the code above was able to assign a track to be loaded
          if ((which === 0 && currtrack !== '') || (which === 1 && previoustrack !== '') || (which === 2 && nexttrack !== '')) {

               // Get full path of currently playing song
               currpath = $('#jquery_jplayer_1').data('jPlayer').status.src;

               // Strip out every thing after the last slash - This is a URL so always use /
               basepath = currpath.substring(0, currpath.lastIndexOf("/"));

               // Create tag used to display currently playing song

               // Use decodeURIComponent() to decode the track in case it has a space in it
               if (which === 0) {
                    newtag = decodeURIComponent(currtrack); // decode filename
               } else if (which === 1) {
                    newtag = decodeURIComponent(previoustrack); // decode filename
               } else if (which === 2) {
                    newtag = decodeURIComponent(nexttrack); // decode filename
               }

               // Remove the file extension
               newtag = newtag.substring(0, newtag.length - 4);

               // Form full URL for the new track

               if (which === 0) {
                    newtrack = basepath + delimiter + currtrack;
               } else if (which === 1) {
                    newtrack = basepath + delimiter + previoustrack;
               } else if (which === 2) {
                    newtrack = basepath + delimiter + nexttrack;
               }

               // Set the tag for the new song
               setCurrentlyPlaying(newtag);

               // make sure path only references / and not backslash
               newtrack = newtrack.replaceAll(delimiter, "/");

               // tell jPlayer to play the new track
               $('#jquery_jplayer_1').jPlayer('setMedia', { mp3: newtrack }).jPlayer('play'); // play song

               // done changing track
               break;
          } // end of if ( (which == 1 && previoustrack != '') || ( which == 2 && nexttrack != '' ) )
     } // end of for (i=1;i<$('#jqueryFileTree li').length;i++)
}

// Prompt user to choose a playlist and returns 
function promptForPlaylist(promptstr, addToNewPlaylist) {
     "use strict";

     // playlists[] Stores all MyMusicServer playlists
     let newline, output_str, playlist_num, retval;

     if (addToNewPlaylist === undefined) {
          addToNewPlaylist = false;
     }

     newline = "\n";

     if (playlists.length === 0 && !addToCurrentPlaylist) {
          alert('You do not have any MyMusicStreamer playlists stored');
          return null;
     }

     // Build the prompt string that is displayed to the user to select a playlist
     output_str = promptstr + newline + newline;

     if (addToNewPlaylist === true) {
          if (myPlaylist.playlist.length === 0) {
               output_str += "0. Add to a new playlist" + newline;
          } else {
               output_str = "0. Add to the existing playlist" + newline;
          }
     }

     // Build numbered list of all playlists
     for (let i = 0; i < playlists.length; i += 1) {
          output_str = output_str + (i + 1) + '. ' + playlists[i].PlaylistName.substring(0, 16);

          // If the next item is not the last one, add a new line
          /*if (i + 1 < playlists.length) {
               output_str = output_str + newline;
          }*/
     }

     playlist_num = '';

     // Loop until the user enters a valid playlist number or clicks on cancel
     while (true) {
          // Prompt user with string that was built above 
          playlist_num = prompt(output_str, '');

          // When user clicks on cancel then cancel loading playlist
          if (playlist_num === null) {
               return null;
          }

          // The value entered must be a number (isNaN(playlist_num)) and a valid number ( if addToNewPlaylist is true, between 0-playlist length, otherwise 1 to playlist length )
          if (isNaN(playlist_num) === false && (((addToNewPlaylist === true && parseInt(playlist_num, 10) >= 0) || (addToNewPlaylist === false && parseInt(playlist_num, 10) >= 1)) && parseInt(playlist_num, 10) <= playlists.length)) {
               break;
          }
     }

     // When the user selects 0 (Add to a new Playlist), return 0
     if (playlist_num === '0') {
          return 0;
     }

     // Use 2 dimensional array to return the playlist name and content
     retval = new Array(2);

     retval[0] = playlists[playlist_num - 1].PlaylistName; // playlist name
     retval[1] = playlists[playlist_num - 1].PlaylistContent; // playlist content

     return retval;

}

// Save the specified playlist to the server
async function savePlaylistToServer(playlistName) {
     "use strict";

     // Check if the playlist is new or not
     const findPlaylistResult = playlists.filter((playlist) => {
          return playlist.PlaylistName === playlistName;
     });

     let isNew = false;
     let existingPlaylistID = null;

     if (findPlaylistResult.length === 0) {
          isNew = true;
     } else if (findPlaylistResult.length === 1) {
          existingPlaylistID = findPlaylistResult[0].PlaylistID;
     } else { // This should never happen
          alert(`More than 1 result was returned in savePlaylistToServer() for the playlist ${playlistName}`);
          return;
     }

     if (typeof playlist[playlistName] === "undefined") {
          alert("No playlist tracks were found");
     }

     if (playlist[playlistName].length === 0) {
          alert("No playlist tracks");
     }

     try {
          const result = await fetch(`php/playlist-scripts/savePlaylist.php?PlaylistName=${newPlaylistName}&PlaylistContent=${json.stringify(playlist[playlistName])}${existingPlaylistID !== null ? `&PlaylistID=${existingPlaylistID}` : ``}`, {});
     } catch (e) {
          console.log(`An error occurred saving the playlist with the error`, e);
     }
}

// Set currently playing tag
function setCurrentlyPlaying(newSong) {
     $('#currSong').html(newSong);
}
// Show or hide all playlist menu items except Load,Delete and Rename options.
function togglePlaylistMenu(showhide, reordering) {
     // These menu items should always be displayed except when reordering. The rest of the items are displayed only when 
     // a playlist is visible

     // The last menu item "Finish reordering this playlist" is never shown until we start to reorder a playlist
     "use strict";

     reordering = (reordering === true ? true : false);

     if (showhide === true) {
          $('#shufflePlaylist').css('display', 'block');
          $('#clearPlaylist').css('display', 'block');
          $('#reorderPlaylist').css('display', 'block');
          $('#sortPlaylist').css('display', 'block');

          if (reordering === true) {
               $('#loadPlaylist').css('display', 'block');
               $('#deletePlaylist').css('display', 'block');
               $('#renamePlaylist').css('display', 'block');
               $('#savePlaylist').css('display', 'block');
               $('#reorderFinish').css('display', 'none');
          }
     } else {
          $('#shufflePlaylist').css('display', 'none');
          $('#clearPlaylist').css('display', 'none');
          $('#sortPlaylist').css('display', 'none');
          $('#reorderPlaylist').css('display', 'none');
          $('#reorderFinish').css('display', 'none');

          if (reordering === true) {
               $('#loadPlaylist').css('display', 'none');
               $('#deletePlaylist').css('display', 'none');
               $('#renamePlaylist').css('display', 'none');
               $('#savePlaylist').css('display', 'none');
               $('#reorderFinish').css('display', 'block');
          }
     }

     return;
}

// Make sure music_path and domain_path point to the same directory
function validPaths() {
     "use strict";

     let domain_str, music_str;

     // Since this function refers to a URL, it will always refer to / no matter which platform the server is running on
     let index = domain_path.indexOf("/Music/");

     if (index != -1) {

          const tmpindex = domain_path.lastIndexOf("/", index - 1)

          if (tmpindex != -1 && domain_path.substring(tmpindex - 1, tmpindex) != "/") {
               domain_str = domain_path.substring(tmpindex);
          } else if (tmpindex != -1) {
               domain_str = domain_path.substring(index);
          }
     }

     index = music_path.indexOf(delimiter + "Music" + delimiter);

     if (index != -1) {
          index = music_path.lastIndexOf(delimiter, index - 1)

          music_str = music_path.substring(index).replaceAll(delimiter, "/");
     }

     if (domain_str == "" || music_str == "" || (domain_str != "" && music_str != "" && domain_str != music_str && domain_str != "/Music/")) {
          alert("The music path and domain path do not match. Please contact the developer. music subpath is '" + music_str + "' and domain subpath is '" + domain_str + "'");

          throw new Error('This is not an error. This is just to stop this page from running.');
     }
}

// This event catches all keypress events on the current page
document.onkeydown = function (e) {
     /*$('#myMusicStreamer_fileTree').on('keypress', function(e){
     alert("yes!!!");
     });*/
     // catch all keypress to monitor for keyboard shortcuts

     "use strict";
     /*$(":focus").each(function() {
     alert($(this).attr("id") + " has focus!");
   });*/

     //console.log($("#myMusicStreamer_fileTree li").is(":active"));
     //console.log($('#myMusicStreamer_fileTree li').is(":focus"));

     /*$('#myMusicStreamer_fileTree').keypress(function(e) {
              alert("YES!");
   });*/

     //  console.log(e.ctrlKey);
     // console.log(e.altKey);

     // up arrow
     if (e.key === 38) {
          // When playlist is being reordered, move the currently selected radio button up 1
          if (isReorderingPlaylist === true) {
               $('#uparrow').click();
          }
     }

     // down arrow
     if (e.key === 40) {
          // When playlist is being reordered, move the currently selected radio button down 1
          if (isReorderingPlaylist === true) {
               $('#downarrow').click();
          }
     }

     // left arrow
     if (e.key === 37) {
          // When playlist is being reordered, move the currently selected radio to the top of the playlist
          if (isReorderingPlaylist === true) {
               $('#firstarrow').click();
          }
     }

     // right arrow
     if (e.key === 39) {
          // When playlist is being reordered, move the currently selected radio to the bottom of the playlist
          if (isReorderingPlaylist === true) {
               $('#lastarrow').click();
          }
     }

     // Ctrl & Alt + , - Turn the volume down
     if (e.ctrlKey && e.altKey && e.key === 188) {
          $('#jquery_jplayer_1').jPlayer('volume', $('#jquery_jplayer_1').data('jPlayer').options.volume - 0.1);
     }

     //  Ctrl & Alt + . - Turn the volume up
     if (e.ctrlKey && e.altKey && e.key === 190) {
          $('#jquery_jplayer_1').jPlayer('volume', $('#jquery_jplayer_1').data('jPlayer').options.volume + 0.1);
     }

     //  Ctrl & Alt + ? - Show list of keyboard shortcuts
     if (e.ctrlKey && e.altKey && e.key === 191) {
          //  If the keyboard shortcut div isn't visible
          if ($('#keyboardShortcutsHelp').css('display') === 'none') {

               // Show it
               $('#keyboardShortcutsHelp').css('display', 'block');

               // Assign the text
               const divText = "Keyboard shortcuts: <BR><BR>Ctrl+Alt+B - Go back 10 seconds in the current track<BR>Ctrl+Alt+C - Stop playing the current track.<BR>Ctrl+Alt+D - Delete a playlist<BR>Ctrl+Alt+E - Reorder this playlist<BR>Ctrl+Alt+F - Finish reordering this playlist<BR>Ctrl+Alt+G - Shuffle this playlist<BR>Ctrl+Alt+J - Set focus on jump-to field to search<BR>Ctrl+Alt+L - Load a playlist<BR>Ctrl+Alt+M - Mute/unmute the current track<BR>Ctrl+Alt+N - Go forward 10 seconds in the current track<BR>Ctrl+Alt+O - Sort the current playlist<BR>Ctrl+Alt+P - Return to folder of currently playing song<BR>Ctrl+Alt+S - Save the current playlist<BR>Ctrl+Alt+T - Jump to Root folder<BR>Ctrl+Alt+V - Play the next track<BR>Ctrl+Alt+X - Play or pause the current track<BR>Ctrl+Alt+Y - Rename a playlist<BR>Ctrl+Alt+Z - Play the previous track<BR>Ctrl+Alt+ , (comma) - Turn the volume down<BR>Ctrl+Alt + . (dot) - Turn the volume up<BR>Ctrl+Alt+1 - Show the Music Browser tab<BR>Ctrl+Alt+2 - Show the Playlist tab<BR>Ctrl+Alt+3 - Show the Recently Added tab<BR>Ctrl+Alt+? - Show/Hide this guide<BR><BR>When reordering the playlist:<BR><BR>Ctrl+Alt+ 1-9 Select the circle next to tracks 1-9 to move them<BR>Up Arrow - moves currently selected track up one<BR>Down Arrow - moves currently selected track down one<BR>Left Arrow - moves currently selected track to the top of the playlist<BR>Right Arrow - moves currently selected track to the bottom of the playlist";

               $('#keyboardShortcutsHelp').html(divText);

               // Set time to automatically hide the keyboard shortcut guide after 20 seconds
               setTimeout(function () {
                    $('#keyboardShortcutsHelp').css('display', 'none');
               }, 20000);
          } else {
               // If the keyboard shortcut guide is already visible, hide it
               $('#keyboardShortcutsHelp').css('display', 'none');
          }
     }

     // Ctrl & Alt 1-9
     if (e.ctrlKey && e.altKey && (e.key >= 49 && e.key <= 57)) {
          // When playlist is being reordered, use Ctrl + 1-9 to select radio boxes #item0 - #item8
          if (isReorderingPlaylist === true) {
               $('#item' + (e.key - 49).toString()).click();
          } else {
               if (e.key == 49) {
                    $("#tabs").tabs("option", "selected", 0); // select tab 0 (file tree)
               } else if (e.key == 50) {
                    $("#tabs").tabs("option", "selected", 1); // select tab 1 (playlist)
               } else if (e.key == 51) {
                    $("#tabs").tabs("option", "selected", 2); // select tab 2 (recently added)
               }
          }
     }

     // Ctrl & Alt + b or B - Go back 10 seconds in the current track
     if (e.ctrlKey && e.altKey && (e.key == 66 || e.key == 98)) {
          $('#jquery_jplayer_1').data('jPlayer').play($('#jquery_jplayer_1').data('jPlayer').status.currentTime - 10);
     }

     // Ctrl & Alt + c or C - stop button click
     if (e.ctrlKey && e.altKey && (e.key == 67 || e.key == 99)) {
          $('.jp-stop').click();
     }

     // Ctrl & Alt + d or d - Delete a playlist
     if (e.ctrlKey && e.altKey && (e.key == 68 || e.key == 100)) {
          $('#deletePlaylist').click();
     }

     // Ctrl & Alt + e or E - Reorder this playlist
     if (e.ctrlKey && e.altKey && (e.key == 69 || e.key == 101)) {
          if (myPlaylist.playlist.length !== 0) {
               if (isReorderingPlaylist === false) {
                    isReorderingPlaylist = true;
                    $('#reorderPlaylist').click();
               }
          }
     }

     // Ctrl & Alt + f or F - Finish reordering this playlist
     if (e.ctrlKey && e.altKey && (e.key == 70 || e.key == 102)) {
          // Only do this when playlist is being reordered
          if (isReorderingPlaylist === true) {
               isReorderingPlaylist = false;
               $('#reorderFinish').click();
          }
     }

     // Ctrl & Alt + g or G - Shuffle this playlist
     if (e.ctrlKey && e.altKey && (e.key == 71 || e.key == 103)) {
          if (myPlaylist.playlist.length !== 0) {
               $('#shufflePlaylist').click();
          }
     }

     // Ctrl & Alt + j or J - Set focus on jump-to field to search
     if (e.ctrlKey && e.altKey && (e.key == 74 || e.key == 106)) {
          $('#jump-to').focus();
     }

     // Ctrl & Alt + l or L - Load a playlist
     if (e.ctrlKey && e.altKey && (e.key == 76 || e.key == 108)) {
          $('#loadPlaylist').click();
     }

     // Ctrl + m or m - Mute/Unmute jPlayer
     if (e.ctrlKey && e.altKey && (e.key == 77 || e.key == 109)) {
          if ($('#jquery_jplayer_1').data('jPlayer').options.muted === false) {
               $('.jp-mute').click();
          } else {
               $('.jp-unmute').click();
          }
     }

     // Ctrl & Alt + n or N - Go forward 10 seconds in the current track
     if (e.ctrlKey && e.altKey && (e.key == 78 || e.key == 110)) {
          $('#jquery_jplayer_1').data('jPlayer').play($('#jquery_jplayer_1').data('jPlayer').status.currentTime + 10);
     }

     // Ctrl & Alt + o or O - Sort the playlist
     if (e.ctrlKey && e.altKey && (e.key == 79 || e.key == 111)) {
          $('#sortPlaylist').click();
     }
     // Ctrl & Alt + p or P - Return to folder of currently playing song
     if (e.ctrlKey && e.altKey && (e.key == 80 || e.key == 112)) {
          $('#currFolder').click();
     }

     // Ctrl & Alt + s or S - Save the current playlist
     if (e.ctrlKey && e.altKey && (e.key == 83 || e.key == 115)) {
          if (myPlaylist.playlist.length !== 0) {
               $('#savePlaylist').click();
          }
     }

     // Ctrl & Alt + t or T - jump to Root folder
     if (e.ctrlKey && e.altKey && (e.key == 84 || e.key == 116)) {
          $('#goBackTopFolder').click();
     }

     // Ctrl + v or V - next button click 
     if (e.ctrlKey && e.altKey && (e.key == 86 || e.key == 118)) {
          $('.jp-next').click();
     }

     // Ctrl & Alt + x or X - play/pause button click
     if (e.ctrlKey && e.altKey && (e.key == 88 || e.key == 120)) {
          if ($('#jquery_jplayer_1').data('jPlayer').status.paused === true) {
               $('.jp-play').click();
          } else {
               $('.jp-pause').click();
          }
     }

     // Ctrl & Alt + y or Y - Rename a playlist
     if (e.ctrlKey && e.altKey && (e.key == 89 || e.key == 121)) {
          if (myPlaylist.playlist.length !== 0) {
               $('#renamePlaylist').click();
          }
     }

     // Ctrl & Alt + z or Z - previous button click
     if (e.ctrlKey && e.altKey && (e.key == 90 || e.key == 122)) {
          $('.jp-previous').click();
     }
}

$(document).ready(function () {
     "use strict";

     // Hide the save this playlist menu item initially
     $('#savePlaylist').css('display', 'none');

     // Init currBrowser
     currBrowser = BrowserDetect.browser;

     // Initialize currPath by calling getMusicPath() which uses JSON to get music_path from the server using PHP
     getMusicPath();

     // Before loading anything, make sure domain_path and music_path point to the same Music folder.
     validPaths();

     // Check if the user is using a mobile device and set isMobileDevice accordingly
     if (BrowserDetect.OS !== "Mac" && BrowserDetect.OS !== "Linux" && BrowserDetect.OS !== "Windows" && BrowserDetect.OS !== "Unix") {
          isMobileDevice = true;
     }

     // Hide all menu items except Load, Delete and Rename playlist
     togglePlaylistMenu(false);

     // Determine if the user is using a supported browser
     if (currBrowser !== 'Android' && currBrowser !== 'Opera' && (currBrowser !== 'Internet Explorer') && currBrowser !== 'Firefox' && currBrowser !== 'Mozilla' && currBrowser !== 'Safari' && currBrowser !== 'Chrome' && currBrowser !== 'iPhone' && currBrowser !== 'iPad') {
          alert('Warning! Your browser is identified as: ' + currBrowser + '. You do not appear to be using a supported browser. This site has not been tested on your browser and may not work for you.');
     }

     // String prototype to determine if a string is a proper number
     String.prototype.isNumber = function () {
          return (/^\d+$/).test(this);
     };

     $('#jquery_jplayer_1').jPlayer({
          ready: async function () {
               if (isMobileDevice === true) {
                    //  Hide the mute/unmute button and volume bar since they don't seem to work in iOS or Android
                    $('.jp-mute').css('display', 'none');
                    $('.jp-unmute').css('display', 'none');
                    $('.jp-volume-bar').css('display', 'none');

                    adjustFileTreeItems();
               }

               const result = await fetch('php/playlist-scripts/getPlaylists.php', {});

               let playlistsResults = await result.json();

               if (playlistsResults[0] != "OK") {
                    alert(playlistsResults[1]);
                    return;
               }

               playlists = playlistsResults[1];

               // Event for
               $('.jp-play-bar').change(function (e) {
                    console.log(new Date().toTimeString() + "here")
               });


               // Event for Next Track button
               $('.jp-next').click(function () {
                    // Do not do anything if there is no song playing
                    if ($('#jquery_jplayer_1').data('jPlayer').status.src == "") {
                         return;
                    }

                    // Process next button click differently when using the playlist
                    if (myPlaylist.playlist.length !== 0) {
                         myPlaylist.next();

                         // Set the tag for the current song
                         setCurrentlyPlaying($('.jp-playlist li').eq(myPlaylist.current).find('.jp-playlist-item').html());

                         return;
                    }

                    // tell PlayTrack() to play the next track - always use / since this is a URL path
                    playTrack(2, $('#jquery_jplayer_1').data('jPlayer').status.src.replaceAll(delimiter, "/").substring($('#jquery_jplayer_1').data('jPlayer').status.src.replaceAll(delimiter, "/").lastIndexOf("/") + 1));
               });

               // Event for Previous Track button
               $('.jp-previous').click(function () {
                    // Do not do anything if there is no song playing
                    if ($('#jquery_jplayer_1').data('jPlayer').status.src == "") {
                         return;
                    }

                    // Process previous button click differently when using the playlist
                    if (myPlaylist.playlist.length !== 0) {
                         myPlaylist.previous();

                         // Set the tag for the current song
                         setCurrentlyPlaying($('.jp-playlist li').eq(myPlaylist.current).find('.jp-playlist-item').html());

                         return;
                    }

                    // tell PlayTrack() to play the previous track
                    playTrack(1, $('#jquery_jplayer_1').data('jPlayer').status.src.replaceAll(delimiter, "/").substring($('#jquery_jplayer_1').data('jPlayer').status.src.replaceAll(delimiter, "/").lastIndexOf("/") + 1));
               });

               // Event for 'Clear the playlist' button
               $('#clearPlaylist').click(function () {
                    if (playlistChanged === true) {
                         if (confirm("The playlist has changed and will be saved") === true) {
                              $('#savePlaylist').click();
                         }
                    }

                    // Remove all items from the playlist
                    myPlaylist.remove();

                    // Hide the playlist
                    hidePlaylist();

                    // Hide the playlist menu options
                    togglePlaylistMenu(false);

                    // Unset the playlist tag
                    $('div#currentPlaylist').html('');

                    // Unset the tag for the current song
                    setCurrentlyPlaying('');

               });

               // Event for 'Return to folder of current playing song' button
               $('#currFolder').click(function () {
                    //  This function will change the jQueryFileTree root to the directory of the currently playing song

                    let currpath;

                    // Get the path of the currently playing song
                    currpath = $('#jquery_jplayer_1').data('jPlayer').status.src;

                    if (currpath === '') {
                         alert('No song is currently playing');
                         return;
                    }

                    // convert the path of the currently playing song from URL format (http://www.somesite.com/Band/Album/01 A Song.mp3)
                    // to a path relative to the server (/var/somepath/MyMusicStreamer/Music/Band/Album/01 A Song.mp3)
                    currpath = convertUrlToPath(currpath);

                    // Remove the file name from currpath
                    currpath = currpath.substring(0, currpath.lastIndexOf(delimiter) + 1);

                    // Tell jQuery file tree to change to the new path
                    changeFileTreePath(currpath);
               });

               // Event for Delete a playlist button
               $('#deletePlaylist').click(async function () {
                    // prompt the User for a playlist to load
                    const retval = promptForPlaylist('Please select the playlist to delete');

                    if (retval === '') {
                         alert('There are no playlists stored on the server');
                         return;
                    }

                    const PlaylistName = retval[0];

                    // Confirm that the user wants to delete this playlist before deleting it. PlaylistName.substring(16)
                    // removed the string "MyMusicStreamer-" from the beginning of the playlist name since I do not want it
                    // to be displayed in the confirmation
                    const answer = confirm('The playlist ' + PlaylistName.substring(16) + ' will be permanently deleted.');

                    if (answer === false) {
                         return;
                    }

                    try {
                         await fetch(`php/playlist-scripts/deleteplaylist.php?PlaylistID=${currentlyPlaylistResult[0].PlaylistID}`, {});
                    } catch (e) {
                         console.log(`An error occured deleting the playlist with the error`, e);
                    }
               });

               // Event for 'Go back to the top folder' button
               $('#goBackTopFolder').click(function () {
                    // Tell jQuery file tree to go back to the root folder
                    changeFileTreePath(music_path);

                    // Set the current path to empty
                    $('div#currentPath').html('');

                    // Set the jump to value to empty
                    $('#jump-to').attr('value', '');
               });

               // As user types into the jump to text field, filter out all items that don't match the search criteria
               $('#jump-to').keyup(function (event) {
                    "use strict";

                    let currline, currsearch, i, startindex;

                    // keep .. if it is at the top (which it is for any folder except the root folder)
                    if ($('#jqueryFileTree li').eq(0).text() === '..') {
                         startindex = 1;
                    } else {
                         startindex = 0;
                    }

                    // loop through all items in FileTree and make all items visible initially
                    // only do this when the user has pressed backspace because there's no way to know
                    // which folders will match the entire set of folders in reverse
                    if (event.key === 8) {
                         for (i = startindex; i < $('#jqueryFileTree li').length; i += 1) {
                              $('#jqueryFileTree li').eq(i).css('display', 'list-item');
                         }
                    }

                    // when the text field is empty, don't do anything else
                    if (document.getElementById('jump-to').value === '') {
                         return;
                    }

                    // loop through all items in FileTree and hide all items that do not match the search criteria
                    for (i = startindex; i < $('#jqueryFileTree li').length; i += 1) {
                         // current line of file tree
                         currline = $('#jqueryFileTree li').eq(i).text().toLowerCase();

                         // search criteria
                         currsearch = document.getElementById('jump-to').value.toLowerCase();

                         // if search criteria isn't found in the current line, hide it
                         if (currline.indexOf(currsearch) === -1) {
                              $('#jqueryFileTree li').eq(i).css('display', 'none');
                         }
                    }
               });

               // Event for 'Load playlist' button
               $('#loadPlaylist').click(async function () {
                    try {
                         if (playlists.length === 0) {
                              alert("There are no playlists");
                              return;
                         }

                         let retval = promptForPlaylist('Please select the playlist to load');

                         if (retval === null || retval == undefined) {
                              return;
                         }

                         if (retval[0] == undefined || retval[1] == undefined) {
                              return;
                         }

                         const PlaylistName = retval[0];
                         const PlaylistContent = retval[1];
                         const PlaylistContentJson = JSON.parse(PlaylistContent);

                         // Set the current playlist tag removing the string "MyMusicStreamer-" from the beginning of the playlist name
                         $('div#currentPlaylist').html(PlaylistName.substring(16));

                         // Remove all items from the existing playlist
                         myPlaylist.remove();

                         // Set flag to indicate to addToCurrentPlaylist() that we are adding multiple tracks to the playlist
                         // so addToCurrentPlaylist() does not try to autoplay the song as it is being added to the playlist.
                         isAddingAllTracks = true;

                         // Add all tracks to playlist
                         Object.keys(PlaylistContentJson).forEach((playlist) => {
                              addToCurrentPlaylist(`${PlaylistContentJson[playlist].Artist} - ${PlaylistContentJson[playlist].Album} - ${PlaylistContentJson[playlist].Track}`, PlaylistContentJson[playlist].Path);
                         });

                         isAddingAllTracks = false;

                         // There's a bug where adding tracks causes the css attribute float of $('.jp-playlist-item-remove') to be set to none 
                         // which causes the 'x' to appear to the left of the track name. This is my workaround which moves the 'x' to
                         // the right of the track name after a short interval.
                         setTimeout(function () {
                              $('.jp-playlist-item-remove').css('float', 'right');
                         }, 100);

                         // Autoplay the playlist - You have to play it after a short interval or it won't work
                         setTimeout(function () {
                              myPlaylist.play(0);
                         }, 1000);

                         // Save current playlist
                         currentMMSPlaylist = PlaylistName;

                         // Remove the queue
                         mmsQueue = null;

                         // Remove the queue from the playlist tab
                         $('.queue-item').remove();

                         // This is for me only. I do this so the playlist is always in a random order
                         if (autoShuffle === true && PlaylistName.substring(16) === "Bass Songs - Learn") {
                              myPlaylist.shuffle();
                         }

                         // Show the playlist menu options
                         togglePlaylistMenu(true);
                    } catch (e) {
                         console.log(`An error occurred loading the playlists`, e);
                    }
               });

               // Event for 'Rename playlist' button
               $('#renamePlaylist').click(async function () {
                    // Rename a playlist

                    // prompt the User for a playlist to load
                    if (playlistChanged === true) {
                         if (confirm("The playlist has changed and will be saved") === true) {
                              $('#savePlaylist').click();
                         }
                    }

                    const retval = promptForPlaylist('Please select the playlist to rename');

                    // promptForPlaylist() returns '' when there are no playlists or null if user clicked on cancel
                    if (retval === '') {
                         alert('There are no playlists stored on the server');
                         return;
                    } else if (retval === null) {
                         return;
                    }

                    const oldPlaylistName = retval[0];

                    // Prompt for the playlist name
                    const newPlaylistName = prompt('Enter the new name for this playlist', oldPlaylistName.substring(16));

                    // if prompt was canceled or user didn't enter a name, do nothing
                    if (newPlaylistName === null || newPlaylistName === '') {
                         return '';
                    }

                    // Set the playlist tag
                    $('div#currentPlaylist').html(newPlaylistName);

                    const currentlyPlaylistResult = playlists.filter((playlist) => {
                         return playlist.PlaylistName === retval[0];
                    });

                    if (currentlyPlaylistResult.length == 0) {
                         alert("Unable to load the playlist in renamePlaylist()");
                         return;
                    } else if (currentlyPlaylistResult.length > 1) { // This should never happen
                         alert("More than 1 result was returned in renamePlaylist()");
                         return;
                    }

                    try {
                         const result = await fetch(`php/playlist-scripts/savePlaylist.php?IsRenaming=true&PlaylistID=${currentlyPlaylistResult[0].PlaylistID}&PlaylistName=${newPlaylistName}`, {});
                    } catch (e) {
                         console.log(`An error occurred saving the playlists with the error`, error);
                    }
               });

               // Event for 'Finish reordering' button
               $('#reorderFinish').click(function () {
                    isReorderingPlaylist = false; // Turn off this flag

                    let i, startIndex, endIndex;

                    // In Internet Explorer, the first item starts at index 1 not 0
                    if (BrowserDetect.OS !== "Windows") {
                         startIndex = 0;
                         endIndex = 7;
                    } else {
                         startIndex = 1;
                         endIndex = 8;
                    }

                    // Show all menu items except the last one which is Finish reordering
                    togglePlaylistMenu(true, true);

                    // Hide the arrow buttons
                    $('#downarrow').remove();
                    $('#firstarrow').remove();
                    $('#lastarrow').remove();
                    $('#uparrow').remove();

                    // Remove the radio buttons
                    for (i = 0; i < myPlaylist.playlist.length; i += 1) {
                         $('#item' + i).remove();
                    }

                    // Reset currPlaylistItem 
                    currPlaylistItem = -1;
               });

               // Event for 'Reorder this playlist' button
               $('#reorderPlaylist').click(function () {

                    isReorderingPlaylist = true; // Set the flag to indicate that a reordering is taking place which will prevent 

                    let currItemName, i, startIndex, endIndex;

                    togglePlaylistMenu(false, true);

                    // Create div for first, up,down and lst arrows
                    $("body").append("<div id='firstarrow'><img src='images/first.png' width=50 height=50></div>");
                    $('#firstarrow').css('position', 'absolute');
                    $('#firstarrow').css('left', $('.jp-playlist').width() + $('.jp-playlist').position().left + 40 + 'px');
                    $('#firstarrow').css('top', $('.pureCssMenu').position().top + 330)

                    $("body").append("<div id='uparrow'><img src='images/up.png' width=50 height=50></div>");
                    $('#uparrow').css('position', 'absolute');
                    $('#uparrow').css('left', $('.jp-playlist').width() + $('.jp-playlist').position().left + 40 + 'px');
                    $('#uparrow').css('top', $('#firstarrow').position().top + $('#firstarrow').height() + 20);

                    $("body").append("<div id='downarrow'><img src='images/down.png' width=50 height=50></div>");
                    $('#downarrow').css('position', 'absolute');
                    $('#downarrow').css('left', $('#uparrow').position().left);
                    $('#downarrow').css('top', $('#uparrow').position().top + $('#uparrow').height() + 20);

                    $("body").append("<div id='lastarrow'><img src='images/last.png' width=50 height=50></div>");
                    $('#lastarrow').css('position', 'absolute');
                    $('#lastarrow').css('left', $('#downarrow').position().left);
                    $('#lastarrow').css('top', $('#downarrow').position().top + $('#downarrow').height() + 20);

                    // Set currPlaylistItem to -1 to indicate no item is selected
                    currPlaylistItem = -1;

                    // Create radio buttons that are used to select an item since theres no documented way to override a file click in the playlist
                    for (i = 0; i < myPlaylist.playlist.length; i += 1) {
                         currItemName = 'item' + i;
                         $(".jp-playlist").append("<div id='playlistItem' + i><input type='radio' name='playlistReorder' id='item" + i + "') value='' /> </div>");
                         $('#item' + i).css('position', 'absolute');
                         $('#item' + i).css('left', $('.jp-playlist-item')[i].offsetLeft - 20 + 'px');
                         $('#item' + i).css('top', $('.jp-playlist-item')[i].offsetTop + 'px');
                    }

               });

               // Event for 'Save playlist' button
               $('#savePlaylist').click(function () {
                    // Save the current playlist
                    let i, currURL, index, playlistName, playlistStr;

                    // Don't do anything if the playlist is empty
                    if (myPlaylist.playlist.length === 0) {
                         // This shouldn't ever happen because Save This Playlist menu option is hidden when the playlist is empty
                         alert("Returning from $('#savePlaylist').click(function() when playlist count is empty");
                         return '';
                    }

                    // Prompt for the playlist name
                    if (currentMMSPlaylist !== null) {
                         playlistName = prompt('Enter the name of the playlist', currentMMSPlaylist?.substring(16));
                    } else {
                         playlistName = prompt('Enter the name of the playlist', '');
                    }

                    if (playlistName === undefined) {
                         playlistName = "";
                    }

                    // if prompt was canceled or user didn't enter a name, don't do anything
                    if (playlistName === null || playlistName === '') {
                         return '';
                    }

                    // Build playlist string that stores all the track names
                    playlistStr = '{';

                    // Loop through each track of the playlist
                    for (i = 0; i < myPlaylist.playlist.length; i += 1) {
                         // Build the string that will be sent to the server

                         // Find the first occurrence of domain_path in the current URL
                         index = myPlaylist.playlist[i].mp3.indexOf(domain_path);

                         // If the domain path is not in the current track, use the full URL. This shouldn't ever happen
                         // because the track is stored as a path that is relative to domain path instead of the full URL 
                         if (index === -1) {
                              currURL = myPlaylist.playlist[i].mp3;
                         } else {
                              currURL = myPlaylist.playlist[i].mp3.substring(index + domain_path.length);
                         }

                         playlistStr = playlistStr + '\'' + myPlaylist.playlist[i].title + '\':\'' + currURL + '\'';

                         // Add a comma after every item except the last one
                         if (i < myPlaylist.playlist.length - 1) {
                              playlistStr = playlistStr + ',';
                         }
                    }

                    // add trailing }
                    playlistStr = playlistStr + '}';

                    // Set the playlist tag
                    $('div#currentPlaylist').html(playlistName);

                    // Save the playlist to the server.
                    savePlaylistToServer('MyMusicStreamer-' + playlistName);

                    // Store the Playlist name as the current one
                    currentMMSPlaylist = 'MyMusicStreamer-' + playlistName;
               });

               // Event for shuffle button
               $('#shufflePlaylist').click(function () {

                    // Shuffle the playlist
                    myPlaylist.shuffle(true, false);

                    // There's a bug where shuffling causes the css attribute float of $('.jp-playlist-item-remove') to be set to none 
                    // This is my workaround which moves the 'x' to  the right of the track name after a set interval.
                    setTimeout(function () {
                         $('.jp-playlist-item-remove').css('float', 'right');
                    }, 10);

                    // Set the tag for the current song
                    setTimeout(function () {

                         // play the first track
                         myPlaylist.play(0);

                         // Set the tag for the current song
                         setCurrentlyPlaying($('.jp-playlist li').eq(myPlaylist.current).find('.jp-playlist-item').html());
                    }, 500);
               });

               // Event for sort playlist menu item
               $('#sortPlaylist').click(function () {

                    // Sort the current playlist
                    "use strict";

                    let counter = 0;

                    // Warn mobile device users that sorting may take a little while
                    if (isMobileDevice === true) {
                         alert("Sorting the playlist. Please wait until it finishes.");
                    }

                    const currentPlaylistArray = myPlaylist.playlist.map(function (i) { return { key: i.title, value: i.mp3 } });

                    currentPlaylistArray.sort(function (a, b) { return a.key > b.key ? 1 : -1; });

                    // Remove all items from the playlist
                    myPlaylist.remove();

                    for (counter = 0; counter < currentPlaylistArray.length; counter++) {
                         // Add the track to the playlist
                         myPlaylist.add({ title: currentPlaylistArray[counter].key, mp3: currentPlaylistArray[counter].value });
                    }

                    // Autoplay the playlist - You have to play it after a short interval or it won't work
                    setTimeout(function () {
                         setCurrentlyPlaying(myPlaylist.playlist[0].title);
                         myPlaylist.play(0);
                    }, 1000);

               });

               //  Initialize the jQueryFileTree when the page has loaded
               $('#myMusicStreamer_fileTree').fileTree({
                    root: music_path,
                    script: 'js/jqueryFileTree/connectors/jqueryFileTree.php',
                    expandSpeed: -1,
                    collapseSpeed: -1,
                    callback: adjustWidth
               },
                    function (file) {
                         file_selected(file);
                    },
                    function (dir) {
                         dir_selected(dir.attr('rel'));
                    }
               );
          },
          swfPath: 'js/jplayer/',
          solution: 'html'
     });

     $("#jquery_jplayer_1").on($.jPlayer.event.ended, function () {
          // When using playlist, call myPlaylist.next() instead of using playTrack() to advanced to the next song.
          if (myPlaylist.playlist.length !== 0) {
               myPlaylist.next();

               setTimeout(function () {
                    // Set the tag for the current song
                    setCurrentlyPlaying(myPlaylist.playlist[myPlaylist.current].title);
               }, 1000);

               return;
          }

          // Get the name of the song that just finished playing
          const currTrack = $('#jquery_jplayer_1').data('jPlayer').status.src;

          if (mmsQueue == null) {
               // Use playTrack to play the next song
               playTrack(2, currTrack.substring(currTrack.lastIndexOf(delimiter) + 1));
          } else {
               // Play the next song in the queue
               getNextQueue(currTrack);

               // Remove the song that just finished playing from the queue tab
               $('.queue-item').each(function () {
                    if (createPlaylistTag(currTrack) == $(this).text()) {
                         $(this).remove();

                         // parse it
                         queue = JSON.parse(mmsQueue);

                         // find current track in queue
                         for (let i = 0; i < queue.length; i++) {
                              if (queue[i] == currTrack) {
                                   queue.splice(i, 1) // Remove index i from the array
                                   mmsQueue = JSON.stringify(queue);
                              }
                         }
                    }
               });


          }
          return;
     });
});

// Event handler for queue item click
$(document).on('click', '.queue-item', function (e) {
     const currTrack = $(this).text();
     $('.queue-item').each(function (index) {
          if (currTrack == $('.queue-item').eq(index).text()) {
               getNextQueue($('.queue-item').eq(index - 1).text());
          }
     });
});

// Event for "Add" link next to a track name
$(document).on('click', '.add', function (e) {
     "use strict";

     let retval, trackPath;

     // Prompt for the playlist to add this track to
     retval = promptForPlaylist('Please select the playlist to add this track to', true);

     if (retval === null) {
          return;
     }

     // This is the proper way to decode the URL since it was encoded in PHP using urlencode()
     trackPath = decodeURIComponent(($(this).attr('rel') + '').replace(/\+/g, '%20'));
     trackPath = domain_path + trackPath.substring(music_path.length).replaceAll(delimiter, "/");

     // Show the playlist menu options
     togglePlaylistMenu(true);

     // When doing decode URL, there is a small bug that causes ' in the track name to be replaced with \". This fixes it
     if (trackPath.indexOf(String.fromCharCode(34)) !== -1) {
          trackPath = trackPath.replace(String.fromCharCode(34), '\'');
     }

     // Add http:// if it isn't at the beginning of the URL
     if (trackPath.substring(0, 7) !== 'http://') {
          trackPath = 'http://' + trackPath;
     }

     // retval == 0 when user selects "Add to new/existing playlist"
     if (retval === 0) {
          // Add the track to the current playlist
          if (addToCurrentPlaylist(createPlaylistTag(trackPath), trackPath) === false) {
               return;
          }

          //  Tell jPlayer to play the song if no song is currently playing
          if ($('#jquery_jplayer_1').data('jPlayer').status.currentTime === 0 && isAddingAllTracks === false) {
               myPlaylist.select(-1);

               // Tell jPlayer to play the media file
               $('#jquery_jplayer_1').jPlayer('setMedia', { mp3: myPlaylist.playlist[myPlaylist.playlist.length - 1].mp3 }).jPlayer('play');

               // Set the tag of the current playing song
               setCurrentlyPlaying(createPlaylistTag(trackPath));
          }

          playlistChanged = true; // set flag indicating that the current playlist has changed

          return;  // Finished logic when adding to existing playlist

     }

     savePlaylistToServer(retval[0]);

     // If the playlist that the user chose to add the song to is already loaded, add it to the current playlist
     if (retval[0] === $('div#currentPlaylist').html()) {
          // Add the track to the current playlist
          addToCurrentPlaylist(createPlaylistTag(trackPath), trackPath);
     }
});

$(document).on('click', '.addAllTracks', function (e) {
     "use strict";

     // This is the proper way to decode the URL since it was encoded in PHP using urlencode()
     const currMusicPath = decodeURIComponent(($(this).attr('rel') + '').replace(/\+/g, '%20'));
     currMusicPath = domain_path + currMusicPath.substring(music_path.length).replaceAll(delimiter, "/");

     // Add http:// if it isn't in the URL
     if (currMusicPath.substring(0, 7) !== 'http://') {
          currMusicPath = 'http://' + currMusicPath;
     }

     // Prompt for the playlist to add this track to
     const retval = promptForPlaylist('Please select the playlist to add this track to', true);

     // when user clicks on null, retval is null. Otherwise, get the platlist name and content 
     if (retval === null) {
          return;
     }

     // loop through all items in FileTree and add each track to the specified playlist
     for (let i = 1; i < $('#jqueryFileTree li').length; i += 1) {
          // Get the current track to the playlist
          const currLine = $('#jqueryFileTree li').eq(i).text();

          // The track name ends in add because of the "add" link. This removes it
          if (currLine.slice(-3) === "add") {
               currLine = currLine.substring(0, currLine.length - 3);
          }

          // Add http:// if it isn't the URL
          if (currMusicPath.substring(0, 7) !== 'http://') {
               currMusicPath = 'http://' + currMusicPath;
          }

          if (retval === 0) {
               // Set flag indicating that we are adding all tracks so addToCurrentPlaylist() won't
               // try to autoplay a song as it gets added to the playlist
               isAddingAllTracks = true;

               // Add the item to the current playlist
               addToCurrentPlaylist(createPlaylistTag(currMusicPath + currLine), currMusicPath + currLine);

               // Unset flag indicating that we are adding all tracks
               isAddingAllTracks = false;

               // If theres at least one item in the playlist, play the first track in the playlist
               if (myPlaylist.playlist.length > 0) {
                    $('#jquery_jplayer_1').jPlayer('setMedia', { mp3: myPlaylist.playlist[0].mp3 }).jPlayer('play');
               }

               // Show the playlist menu options
               togglePlaylistMenu(true);

               playlistChanged = true; // set flag indicating that the current playlist has changed
          } else {
               //const PlaylistName = retval[0];
               const playlistContent = retval[1];

               if (playlistContent.indexOf(createPlaylistTag(currMusicPath + currLine)) !== -1) {
                    if (confirm("The track " + createPlaylistTag(currMusicPath + currLine) + " is already in the playlist. If you do not want to add it click on cancel.") === false) {
                         continue;
                    }
               }

               const newPlaylistContent = JSON.parse(playlistContent);

               const newTrack = {
                    "PlaylistID": playlists[currentMMSPlaylist].PlaylistID,
                    "Artist": "Artist 1",
                    "Album": "Album 1",
                    "Track": "1",
                    "Path": "C:\\\\\\\\MusicTrack1"
               };

               // TODO: Fix me

               //newPlaylistContent.push()

               // Add the track to the end of the playlist by modifying the string containing the playlist content
               /*PlaylistContent = PlaylistContent.replace("'}", "','" + createPlaylistTag(currMusicPath + currLine) + "':'" + currMusicPath + currLine + "'}");

               // Save the new content in localStorage
               //localStorage.setItem(PlaylistName, PlaylistContent);

               // If the playlist that the user chose to add the song to is already loaded, add it to the current playlist
               if (PlaylistName === "MyMusicStreamer-" + $('div#currentPlaylist').html()) {
                    // Add the track to the current playlist
                    addToCurrentPlaylist(createPlaylistTag(currMusicPath + currLine), currMusicPath + currLine);
               }*/
          } // end of if (retval === 0)
     } // end of for loop

     // If the user is not adding to a playlist that is already loaded, only save after everything is complete to reduce 
     // overhead
     if (retval !== 0) {
          savePlaylistToServer(PlaylistName);
     }

     // Update the tag for the currently playing song
     setCurrentlyPlaying($('.jp-playlist li').eq(myPlaylist.current).find('.jp-playlist-item').html());
});

$(document).on('click', '.jp-playlist-item', function (e) {
     // Update the tag for the currently playing song
     setCurrentlyPlaying($('.jp-playlist li').eq(myPlaylist.current).find('.jp-playlist-item').html());
});

$(document).on('click', '.jp-playlist-item-remove', function (e) {
     // Remove item from playlist
     for (let i = 0; i < myPlaylist.playlist.length; i++) {
          if (myPlaylist.playlist[i].title === $(this).parent()[0].children[1].innerText) {
               myPlaylist.remove(i);
          }
     }

     if (currentMMSPlaylist !== null) {
          const currentPlaylistResult = playlists.filter((playlist) => {
               return playlist.PlaylistName === currentMMSPlaylist;
          });

          if (currentPlaylistResult.length === 1) {
               const currentPlaylistContent = currentPlaylistResult[0].PlaylistContent;
               const currentPlaylistContentJSON = JSON.parse(currentPlaylistContent);

               debugger;
          }

          //savePlaylistToServer(currentMMSPlaylist);
     }

     "use strict";

     playlistChanged = true; // set flag indicating that the current playlist has changed

     setTimeout(function () {
          if (myPlaylist.playlist.length === 0) {
               hidePlaylist();

               // Unset the playlist tag
               $('div#currentPlaylist').html('');
          } else {
               // Automatically adjust the playlist height as needed
               // Commented out on 09-06-24. Doesn't look nice
               //adjustPlaylistHeight();
          }
     }, 500);
});

// This event captures a click event on any of the radio buttons that are used when reordering a playlist
$(document).on('change', 'input[type=radio]', function (e) {
     "use strict";

     // The radio buttons are named item0,item1 etc so get everything after item and convert it to a number
     currPlaylistItem = parseInt(e.currentTarget.id.substring(e.currentTarget.id.indexOf("item") + 4), 10);
});

// Event for "Down Arrow" button
$(document).on('click', '#downarrow', function (e) {
     "use strict";

     // When moving down, do not move past the last index
     if (currPlaylistItem + 1 < myPlaylist.playlist.length) {
          movePlaylistItem(currPlaylistItem, currPlaylistItem + 1);
     }


});

// Event for "First Arrow" button
$(document).on('click', '#firstarrow', function (e) {
     "use strict";

     playlistChanged = true; // set flag indicating that the current playlist has changed

     while (currPlaylistItem > 0) {
          movePlaylistItem(currPlaylistItem, currPlaylistItem - 1);
     }

});

// Event for "Last Arrow" 
$(document).on('click', '#lastarrow', function (e) {
     "use strict";

     playlistChanged = true; // set flag indicating that the current playlist has changed

     while (currPlaylistItem < myPlaylist.playlist.length - 1) {
          movePlaylistItem(currPlaylistItem, currPlaylistItem + 1);
     }

});

// Event for "Up Arrow" 
$(document).on('click', '#uparrow', function (e) {
     "use strict";

     playlistChanged = true; // set flag indicating that the current playlist has changed

     // When moving up, do not move past index 0
     if (currPlaylistItem - 1 >= 0) {
          movePlaylistItem(currPlaylistItem, currPlaylistItem - 1);
     }

});

$(document).on('click', '#tabs', function (e) {
     activeTab = $('#tabs').tabs('option', 'active');

     if ($('#tabs').tabs('option', 'active') === 0) {
          $('.jp-playlist').fadeOut("slow");

          // This fixes a bug in FF for Android that resizes these elements and makes them much bigger
          $('#currFolder').css('height', '17px');
          $('#goBackTopFolder').css('height', '17px');
          $('#jumpTo').css('height', '19px');
          $('#jumpTo').css('width', '599px');
     } else if ($('#tabs').tabs('option', 'active') === 1) {
          // Fix .jp-playlist left displacement
          $('.jp-playlist').css('left', 'auto');

          // make the playlist visible
          $('.jp-playlist').css('display', 'block');

          adjustPlaylistHeight();
     } else if ($('#tabs').tabs('option', 'active') === 2) {
          generateRecentlyAdded($("#RecentDuration option:selected").val());
     } else if ($('#tabs').tabs('option', 'active') === 3) {
          //adjustPlaylistHeight();
     }
     // stretch the playlist width to match the 2nd tab
     $('.jp-playlist').css('width', getRelativeValue('#tabs-2', 'width', 15));

     // move the playlist to the top of the 2nd tab
     $('.jp-playlist').css('top', '55px');

     // make the playlist height match the tab height
     $('.jp-playlist').css('height', '450px');

});

$(document).on('change', '#RecentDuration', function (e) {
     generateRecentlyAdded($("#RecentDuration option:selected").val());
});

$(document).on('click', '.recentArtist', function (e) {
     changeFileTreePath(music_path + $.trim($(this).text()) + delimiter)

     setTimeout(function () {
          $("#tabs").tabs("option", "selected", 0); // select tab 0	  
     }, 500);
});

/*
// right click item to give filetree focus. continue here
$('#myMusicStreamer_fileTree').keypress(function(e) {
// $('#myMusicStreamer_fileTree li').position() or look at mouseover
alert("YES!");
});

$('#myMusicStreamer_fileTree').mousemove(function(e){
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;
        console.log("X: " + x + " Y: " + y); 
    });

$('#myMusicStreamer_fileTree').mouseover(function(e){
        var x = e.pageX - this.offsetLeft;
        var y = e.pageY - this.offsetTop;
        console.log("X: " + x + " Y: " + y); 
});
*/

/* 

HTML
<input type="text" id="autofill"/> Press enter to view items
<div class="services">
    <div class="items">
        <ul>                           
            <li class="mail-icon selected"><a href="#" id="mail">mail</a></li>
            <li class="forum-icon"><a href="#" id="forum">lang</a></li>
            <li class="chat-icon"><a href="#" id="chat">chat</a></li>
        </ul>
    </div>
</div>

JS

$(".services").show();
$('.items li').removeClass("selected");
$("#autofill").keydown(function(e){

    $('.items li').each(function() {  
         if ( $(this).text().substring(0,1).toLowerCase() == String.fromCharCode(e.key+32) ) {
              $('.items li').removeClass("selected");
             $(this).addClass("selected");
         }
    });
});


*/
<?php
/*
     session_start();
     
     $local_ip="10.0.1.28";

     if ( !isset($_SESSION['CURR_USER']) ) {
          if ( $local_ip != "" && $local_ip != $_SERVER[HTTP_HOST] ) {
          
               // Set referrer so login.php knows which script called it
               $_SESSION['Referrer']="index.php";
               //header('Location:login.php');
          }
     }
*/
?>

<!DOCTYPE html>

<!-- Use <HTML debug='true'> when debugging ith Firebug Lite -->
<HTML>
     <head>
          <meta charset="utf-8" />
          <title>MyMusic Streamer</title>
    
          <link rel='shortcut icon' href='images/favicon.ico'>
          <link href='MyMusicStreamer.css' rel='stylesheet' type='text/css' />
     
          <!-- Load jQuery -->
          <script src="js/jquery-1.8.0.min.js"></script>
    
          <!-- Load jQueryFileTree -->
          <script src='js/jqueryFileTree/jqueryFileTree.js' type='text/javascript'></script>
          <script src='js/jqueryFileTree/jquery.easing.js' type='text/javascript'></script>
          <script src='js/jConfirmAction.jquery.js' type='text/javascript'></script>
          <link href='js/jqueryFileTree/jqueryFileTree.css' rel='stylesheet' type='text/css' media='screen' /> 
    
          <!-- Load jQueryUI --> 
          <link rel="stylesheet" href="js/jQueryUI/css/jquery-ui.css" />
          <script src="js/jQueryUI/jquery-ui.js"></script>

          <link rel="stylesheet" href="js/jQueryUI/style.css" />
   
          <!-- Load jPlayer -->
          <script type='text/javascript' src='js/jplayer/jquery.jplayer.js'></script>
          <script type='text/javascript' src='js/jplayer/jplayer.playlist.min.js'></script>
     
          <script src='js/MyMusicStreamer.js'></script>
     
          <script>
               $(function() {
                     $( "#tabs" ).tabs();
               });
          </script>
     </head>

     <BODY>
          <div id='jquery_jplayer_1' class='jp-jplayer'></div>

          <div id='jp_container_1' class='jp-audio'>
               <div class='jp-type-single'>
                    <div id='jp_interface_1' class='jp-gui jp-interface'>
                         <div id='currSong'></div>
                         <ul class='jp-controls'>
                              <li><a href='javascript:;' class='jp-previous' tabindex='1'>previous</a></li>
                              <li><a href='javascript:;' class='jp-play' tabindex='1'>play</a></li>
                              <li><a href='javascript:;' class='jp-pause' tabindex='1'>pause</a></li>
                              <li><a href='javascript:;' class='jp-stop' tabindex='1'>stop</a></li>
                              <li><a href='javascript:;' class='jp-next' tabindex='1'>next</a></li>
                              <li><a href='javascript:;' class='jp-mute' tabindex='1'>mute</a></li>
                              <li><a href='javascript:;' class='jp-unmute' tabindex='1'>unmute</a></li>
                         </ul>

                         <div class='jp-progress'>
                              <div class='jp-seek-bar'>
                                   <div class='jp-play-bar'></div>
                              </div>
                         </div>
                         
                         <div class='jp-volume-bar'>
                                   <div class='jp-volume-bar-value' ></div>
                         </div>
                         
                         <div class='jp-current-time'></div>
                         <div class='jp-duration'></div>
                    </div> <!-- End of <div id='jp_interface_1' class='jp-gui jp-interface'> -->

                    <div id='keyboardShortcutsHelp'></div>
               </div> <!-- End of <div class='jp-type-single'> -->
          </div> <!-- End of <div id='jp_container_1' class='jp-audio'> -->
 
          <div id="tabs">
               <ul>
                    <li><a href="#tabs-1">Music Browser</a></li>
                    <li><a href="#tabs-2">Playlists</a></li>
                    <li><a href="#tabs-3">Recently Added</a></li>
					<li><a href="#tabs-4">Queue</a></li>
               </ul>
          <div id="tabs-1">
     
               <!-- Load jQueryFileTree -->
               <div id="myMusicStreamer_fileTree" class="fileTreeCSS"></div>
               <div id='currentPath'></div><BR />
               <button class='ui-state-default ui-corner-all' name='goBackTopFolder' type='button' id='goBackTopFolder'>Go back to the top folder</button>
               <button class='ui-state-default ui-corner-all' name='currFolder' type='button' id='currFolder'>Return to folder of currently playing song</button>
               <div id='jumpTo'>
                    Jump To: <input id='jump-to' type='text'/><BR>
               </div>
          </div>
          
          <div id="tabs-2">         
               <ul class='pureCssMenu pureCssMenum'>
                    <li class='pureCssMenui'><a id='playlistMenu' class='pureCssMenui'><span>Playlist Menu</span></a>
                              <ul class='pureCssMenum'>
                                   <li class='pureCssMenui'><a id='loadPlaylist' class='pureCssMenui'>Load a playlist</a></li>
                                   <li class='pureCssMenui'><a id='deletePlaylist' class='pureCssMenui' href='javascript:;'>Delete a playlist</a></li>
                                   <li class='pureCssMenui'><a id='renamePlaylist' class='pureCssMenui' href='javascript:;'>Rename a playlist</a></li>
                                   <li class='pureCssMenui'><a id='savePlaylist' class='pureCssMenui' href='javascript:;'>Save this playlist</a></li>
                                   <li class='pureCssMenui'><a id='shufflePlaylist' class='pureCssMenui' href='javascript:;'>Shuffle this playlist</a></li>
                                   <li class='pureCssMenui'><a id='clearPlaylist' class='pureCssMenui' href='javascript:;'>Clear this playlist</a></li>
                                   <li class='pureCssMenui'><a id='sortPlaylist' class='pureCssMenui' href='javascript:;'>Sort this playlist</a></li>
                                   <li class='pureCssMenui'><a id='reorderPlaylist' class='pureCssMenui' href='javascript:;'>Reorder this playlist</a></li>
                                   <li class='pureCssMenui'><a id='reorderFinish' class='pureCssMenui' href='javascript:;'>Finish reordering</a></li>
                              </ul>
                         </li>
                    </ul>
                
                    <BR /><BR>
                
                    <div id='currentPlaylist'></div>
                    <div id='jquery_jplayer_1' class='jp-jplayer'></div>

                    <div id='jp_container_1' class='jp-audio'>
                         <div class='jp-type-playlist'>
                              <div class='jp-playlist'>
			           <ul>
                                   </ul>
                              </div>
                         </div>
                    </div>
               </div>
                
               <div id="tabs-3"> 

                    Added in the last <select id="RecentDuration">
                         <option value="90">90</option>                         
						 <option value="60">60</option>
                         <option value="30">30</option>
						 <option value="29">29</option>
						 <option value="28">28</option>
						 <option value="27">27</option>
						 <option value="26">26</option>
						 <option value="25">25</option>
						 <option value="24">24</option>
						 <option value="23">23</option>
						 <option value="22">22</option>
						 <option value="21">21</option>
						 <option value="20">20</option>
						 <option value="19">19</option>
						 <option value="18">18</option>
						 <option value="17">17</option>
                         <option value="16">16</option>
						 <option value="15">15</option>
						 <option value="14">14</option>
						 <option value="13">13</option>
						 <option value="12">12</option>
						 <option value="11">11</option>
						 <option value="10">10</option>
						 <option value="9">9</option>
						 <option value="8">8</option>
                         <option selected value="7">7</option>
						 <option value="6">6</option>
						 <option value="5">5</option>
						 <option value="4">4</option>
						 <option value="3">3</option>
						 <option value="2">2</option>
                         <option value="1">1</option>
                    </select> days<BR><BR>
               </div>
			   <div id="tabs-4"> 
			   </div>
               </div>        
               <BR><BR>
          </div>
          <BR><BR>

          <A HREF='http://apps.hovav.org/mymusicstreamer' id='homepage' target='_blank'>MyMusicStreamer web site</A>
          
          <BR><BR>
     </body>
</html>

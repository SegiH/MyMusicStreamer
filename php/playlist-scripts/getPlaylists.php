<?php

     // Setting return value to an empty string indicates that an error occurred or nothing was found

     include '../login.php';

     // Get playlists SQL
     $selectPlaylistSQL = "SELECT * FROM Playlists ORDER BY PlaylistName;";

     $playlistResult = mysqli_execute_query($mms_connect, $selectPlaylistSQL);

     // //JOIN PlaylistTracks ON PlaylistTracks.PlaylistID=Playlists.PlaylistID

     // Stores outputted playlist info
     $output=array();

     // Loop through all rows and add to array 
     while ($playlistRow=$playlistResult->fetch_assoc()) {
          $playlistContentArray=array();

          $playlistContentSQL = "SELECT * FROM PlaylistTracks WHERE PlaylistID=?";

          $playlistContentResult = mysqli_execute_query($mms_connect, $playlistContentSQL, [$playlistRow['PlaylistID']]);
          
          while($playlistContentRow = $playlistContentResult->fetch_assoc()) {
               array_push($playlistContentArray,$playlistContentRow);   
          }

          array_push($output,array("PlaylistID" => $playlistRow['PlaylistID'], "PlaylistName" => $playlistRow['PlaylistName'],"PlaylistContent" => json_encode($playlistContentArray)));
     }
  
     echo json_encode(["OK", $output]);
?>

<?php
     include '../login.php';

     $playlistID = $_GET['PlaylistID'];
     $playlistName = $_GET['PlaylistName'];

     if ($playlistID == NULL) {
          die("Playlist ID was not provided");
     }

     if ($playlistName == NULL) {
          die("New playlist name was not provided");
     }

         //$playlistNameSQL = "UPDATE " . $playlist_table_name . " SET PlaylistName=? WHERE PlaylistID=?;";
     $renamePlaylistNameSQL = "UPDATE " . $playlist_table_name . " SET PlaylistName=? WHERE PlaylistID=;";

     $stmt = mysqli_prepare($mms_connect, $renamePlaylistNameSQL);
     mysqli_stmt_bind_param($stmt, "si", $playlistName, $playlistID); 
     mysqli_stmt_execute($stmt);

     /*$stmt = mysqli_prepare($mms_connect, $renamePlaylistNameSQL);
     mysqli_stmt_bind_param($stmt, "si", $playlistName, $playlistID); 
     mysqli_stmt_execute($stmt);*/
?>

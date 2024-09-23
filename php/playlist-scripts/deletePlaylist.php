<?php

     include '../login.php';
     
     $playlistID = $_GET['PlaylistID'];

     if ($playlistID == NULL) {
          die("Playlist ID was not provided");
     }

     // Delete playlist SQL
     $deletePlaylistSQL = "DELETE FROM Playlists WHERE PlaylistID=?";

     $stmt = mysqli_prepare($mms_connect, $deletePlaylistSQL);
     mysqli_stmt_bind_param($stmt, "i", $playlistID); 
     mysqli_stmt_execute($stmt);
?>

<?php
     include '../login.php';

     $playlistID = $_GET['PlaylistID'];

     $playlistName = $_GET['PlaylistName'];

     $isRenaming = $_GET['IsRenaming'];

     if ($playlistName == NULL) {
          die("Playlist name was not provided");
     }

     $playlistContent = $_GET['PlaylistContent'];

     if ($isRenaming !== "true") {
          if ($playlistContent == NULL) {
               die("Playlist content was not provided");
          }

          $playlistContent = json_decode($playlistContent,true);

          if ($playlistContent == NULL) {
               die("Unable to parse the playlist content");
          }
     }

     if ($isRenaming !== "true" && $playlistID === null) { // New playlist
          $playlistNameSQL = "INSERT INTO " . $playlist_table_name . " (PlaylistName) VALUES (?);";
          $stmt = mysqli_prepare($mms_connect, $playlistNameSQL);
          mysqli_stmt_bind_param($stmt, "s", $playlistName); 
          mysqli_stmt_execute($stmt);
     } else if ($playlistID !== null){
          $playlistNameSQL = "UPDATE " . $playlist_table_name . " SET PlaylistName=? WHERE PlaylistID=?;";
          $stmt = mysqli_prepare($mms_connect, $playlistNameSQL);
          mysqli_stmt_bind_param($stmt, "si", $playlistName, $playlistID); 
          mysqli_stmt_execute($stmt);
     }

     $nextID = $stmt->insert_id;

     if ($nextID == 0) {
          $nextIDSql = "SELECT PlaylistID FROM Playlists WHERE PlaylistName=?";

          $result = mysqli_execute_query($mms_connect, $nextIDSql, [$playlistName]);
         
          if ($result->num_rows > 0) {
               while($row = $result->fetch_assoc()) {
                    $nextID = $row["PlaylistID"];
               }
          }
     }

     // Delete all old playlist tracks first
     $deletePlaylistTracks = "DELETE FROM " . $playlist_tracks_table_name . " WHERE PlaylistID=?";
     $stmt = mysqli_prepare($mms_connect, $deletePlaylistTracks);
     mysqli_stmt_bind_param($stmt, "i", $nextID); 
     mysqli_stmt_execute($stmt);

     if ($isRenaming !== "true") {
          // Insert new playlist tracks
          for ($i=0;$i<sizeof($playlistContent);$i++) {
               $playlistContentSQL = "INSERT INTO " . $playlist_tracks_table_name . " (playlistID, Artist, Album, Track, Path) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE playlistID=?, Artist=?, Album=?, Track=?, Path=?;";
               $stmt = mysqli_prepare($mms_connect, $playlistContentSQL);
               mysqli_stmt_bind_param($stmt, "ssssssssss", $nextID, $playlistContent[$i]["Artist"], $playlistContent[$i]["Album"], $playlistContent[$i]["Track"], $playlistContent[$i]["Path"], $nextID, $playlistContent[$i]["Artist"], $playlistContent[$i]["Album"], $playlistContent[$i]["Track"], $playlistContent[$i]["Path"]);
               mysqli_stmt_execute($stmt);
          }
     }
?>

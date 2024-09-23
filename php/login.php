<?php

// Validate that the DB related environment variables are set
$database_username = getenv("MMS_Username");
$database_password = getenv("MMS_Password");
$database_host = getenv("MMS_DatabaseHost");
$database_name = getenv("MMS_DatabaseName");

if ($database_username == null) {
     errorOccured("MMS_Username environment variable is not set ");
}

if ($database_password == null) {
     errorOccured("MMS_Password environment variable is not set ");
}

if ($database_host == null) {
     errorOccured("MMS_DatabaseHost environment variable is not set ");
}

if ($database_name == null) {
     errorOccured("MMS_DatabaseName environment variable is not set ");
}

if ($database_name == null) {
     errorOccured("MMS_DatabaseName environment variable is not set ");
}

$playlist_table_name="Playlists";
$playlist_tracks_table_name="PlaylistTracks";

// Try to connect
$mms_connect = new mysqli($database_host,$database_username,$database_password,$database_name); 

// Make sure DB connect worked
if ( !$mms_connect) {
     errorOccured("Connection to DB failed 2");
}

// Create the tables
try {
     $sql = "CREATE TABLE IF NOT EXISTS " . $playlist_table_name . " (PlaylistID INT NOT NULL AUTO_INCREMENT, PlaylistName VARCHAR(200) NOT NULL, PRIMARY KEY(PlaylistID));";

     $result = $mms_connect->query($sql);

     if (!$result) {
          errorOccured("An error occurred creating the playlists");
     }

     $sql = "CREATE TABLE IF NOT EXISTS " . $playlist_tracks_table_name . " (
          PlaylistTrackID INT NOT NULL AUTO_INCREMENT, 
          PlaylistID INT NOT NULL,
          Artist VARCHAR(2000) NOT NULL,
          Album VARCHAR(2000) NOT NULL,
          Track VARCHAR(2000),
          Path VARCHAR(2000) NOT NULL,
          PRIMARY KEY(PlaylistTrackID)
     );";

     $result = $mms_connect->query($sql);

     if (!$result) {
          errorOccured("An error occurred creating the playlists");
     }
} catch (Exception $ex) {
     errorOccured($ex);
}
     
// I include this here because all my php scripts include login.php anyway
function errorOccured($str) {
     die(json_encode(["ERROR", $str]));
}
?>

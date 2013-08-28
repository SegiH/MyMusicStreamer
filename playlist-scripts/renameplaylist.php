<?php

     include '../login.php';


     // create response object
     $json = array();

     // Create the table
     $result = $mms_connect->query("CREATE TABLE IF NOT EXISTS " . $table_name . "(
                       id INT NOT NULL AUTO_INCREMENT, 
                       PRIMARY KEY(id), 
                       PlaylistName TEXT(50),
                       PlaylistContent TEXT(1000)
                       )");

     // Return error if Table create failed
     if ( !$result ) {
          errorOccured("Unable to create the table " . $table_name);
     }
     
     $decoded = json_decode($_POST['json'],true);

     $result = $mms_connect->query("UPDATE " . $table_name . " set PlaylistName = \"" . $decoded['NewPlaylistName'] . "\" where PlaylistName = \"" . $decoded['OldPlaylistName'] . "\"");

     if ( !$result )  {
          errorOccured("Unable to read the table " . $table_name);
     }
     
     mysqli_close($db_connect);
?>

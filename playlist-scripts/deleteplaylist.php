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
     if ( !$result) {
          errorOccured("Unable to create the table " . $table_name);
     }
     
     $decoded = json_decode($_POST['json'],true);

     // Read all rows
     $result = $mms_connect->query("SELECT * FROM " . $table_name . " where PlaylistName = \"" . $decoded['PlaylistName' . $i] . "\"");
     
     if ( !$result )  {
          errorOccured("Unable to read the table " . $table_name);
     }
     
     // If this playlist exists so overwrite it with the new one. The Javascript code will prompt the user to confirm that it is ok to delete it
     if ( $result->num_rows == 0 ) {
         errorOccured("The playlist " . $decoded['PlaylistName' . $i] . "does not exist in the table");
     }
               
     $result = $mms_connect->query("Delete from " . $table_name . " where PlaylistName = \"" . $decoded['PlaylistName'] . "\"");

     // Return error if delete failed
     if ( !$result) {
          errorOccured("Unable to delete row" . mysql_error() . "\n\"" . $str . "\"");
     }
     
     mysqli_close($db_connect);
?>

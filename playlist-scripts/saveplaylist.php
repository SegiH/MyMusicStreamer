<?php
     include '../login.php';
	 
     // create response object
     $json = array();

     // Create the table
     /*$result = $mms_connect->query("CREATE TABLE IF NOT EXISTS " . $table_name . "(
                            id INT NOT NULL AUTO_INCREMENT, 
                            PRIMARY KEY(id), 
                            PlaylistName TEXT(50),
                            PlaylistContent TEXT(1000)
                            )");
							*/
     // Return error if Table create failed
     if ( $result != NULL ) {
          errorOccured("Unable to create the table " . $table_name);
     }
	 
     $decoded = json_decode($_POST['json'],true);
 
     if ( $decoded == null ) {
          errorOccured("NULL value");
     }

     // Add quotation mark before PlaylistContent if it isn't there
     if ( $decoded['PlaylistContent'][0] != '"' ) {
          $decoded['PlaylistContent'] = '"' . $decoded['PlaylistContent'];
     }

     // Add quotation mark at the end of PlaylistContent if it isn't there
     if ( substr($decoded['PlaylistContent'],-1) != '"' ) {
          $decoded['PlaylistContent'] = $decoded['PlaylistContent'] . '"';
     }

	 $sql='SELECT * FROM ' . $table_name . ' where PlaylistName = "' . $decoded['PlaylistName'] . '"';
     
	 // Read all rows
     $result = $mms_connect->query($sql);
     
     if ( $result == NULL )  {
          errorOccured("Unable to read the table " . $table_name);
     }
     
     // If this playlist exists so overwrite it with the new one. The Javascript code will prompt the user to confirm that it is ok to delete it
     if ( $result->num_rows != 0 )
          $str = "UPDATE " . $table_name . " set PlaylistContent=" . str_replace("''","'",$decoded['PlaylistContent']) . " where PlaylistName=\"" . $decoded['PlaylistName'] . "\"";
     else {
          $str = "INSERT INTO " . $table_name . "(PlaylistName,PlaylistContent) VALUES (\"" . $decoded['PlaylistName'] . "\"," . $decoded['PlaylistContent'] . ")";
     }

     $result = $mms_connect->query($str,$db_connect);
     
     if ( !$result) {
          errorOccured("Error with the SQL statement " . $str);
     }

     mysqli_close($db_connect);
?>

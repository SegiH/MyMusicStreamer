<?php

     // Setting return value to an empty string indicates that an error occurred or nothing was found

     include '../login.php';
     
     // Create the MMS table
     $result = $mms_connect->query("CREATE TABLE IF NOT EXISTS " . $table_name . "(
                            id INT NOT NULL AUTO_INCREMENT, 
                            PRIMARY KEY(id), 
                            PlaylistName TEXT(50),
                            PlaylistContent TEXT(1000)
                            )");

     // Return error if Table create failed
     if ( !$result) {
          //echo json_encode(array("value" => mysql_error()));
          die('');
     }
     
     // Read all rows
     $result = $mms_connect->query("SELECT * FROM " . $table_name . " limit 1 ORDER BY PlaylistName");

     // If an error occurred reading the table return an error
     if ( !$result ) {
          //echo json_encode(array("value" => mysql_error()));
          die('');
     } 

     // I return 0 to indicate that no error occurred but the table is empty
     if ( $result->num_rows == 0) {
          echo json_encode(array("value" => "0"));
          die;
     }

     // Stores outputted playlist info
     $output=array();

     $fh = fopen("playlist-dump.txt", 'w') or die("can't open file");
     
     
     
     // Loop through all rows and add to array 
     while ($row=$result->fetch_array(MYSQLI_ASSOC)) {
          fwrite($fh, $row['PlaylistContent']);
          //array_push($output,array("PlaylistName" => $row['PlaylistName'],"PlaylistContent" => $row['PlaylistContent']));
     }
    fclose($fh);
    
    die("done");
     //echo json_encode($output);

?>

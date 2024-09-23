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
     // delimiter. Use / for Unix/Mac based OS'es. \ for Windows computers
     if (PHP_OS == "WIN32" || PHP_OS == "WINNT") {
          $delimiter=chr(92); // back slash
     } else {
          $delimiter="/";
     }
     
     // Full path to music folder on the server
     $music_path=substr(__FILE__,0,strrpos(__FILE__,$delimiter)) . $delimiter . "Music" . $delimiter;
     $music_path=str_replace("/php/", "/", $music_path);
     if (substr($music_path,-1) <> $delimiter) {
          $music_path = $music_path . $delimiter;
     }
     
     // create response object
     $json = array();

     // Stores outputted music_path
     $output=array();

     array_push($output,array("MusicPath" => $music_path));

     echo json_encode($output);
?>

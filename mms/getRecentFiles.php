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
     $data = json_decode($_POST['data'], true);
	 
      // Get the duration
     $interval = intval($data['duration']); 
	 
	 $modified=array(); 
	 
	 // make sure duration provided is a number
	 if ( is_numeric($interval) == FALSE ) {
	      die('Invalid value for duration in getRecentFiles.php');
	 }
	 
     $json = scandir($data['currpath']);

     foreach ($json as $value) {

        if ( is_dir($data['currpath'] . $value) == true  && $value != "." && $value != ".." ) {
	     $val = abs(time()-filemtime($data['currpath'] . $value))/60/60/24;
             if ( $val <= $interval) {
                  array_push($modified,$value);
             } 
	    }
     }
      
     echo json_encode($modified);

?>

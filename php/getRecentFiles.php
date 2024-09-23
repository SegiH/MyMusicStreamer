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
     
     $fileList=array();

     function recursive_dir_listing($dir){ 
          global $fileList;
         
          $subdir=preg_split('@/@',$dir);

          unset($subdir);

          foreach(scandir($dir) as $file){
               $fileOrDir=$dir.DIRECTORY_SEPARATOR.$file;

               if ($file != '.' && $file != '..') {
                    if (is_dir($fileOrDir)) {
                         recursive_dir_listing($fileOrDir);
                    } else {
                         array_push($fileList, str_replace("//", "/", $fileOrDir));
                    }
               }
          }

          return $fileList;
        }

     $data = json_decode($_GET['data'], true);
	
     // Get the duration
     $interval = intval($data['duration']); 

	$modified=array(); 
	 
	// make sure duration provided is a number
	if ( is_numeric($interval) == FALSE ) {
	      die('Invalid value for duration in getRecentFiles.php');
	}
	 
     $data['currpath'] = str_replace("/php/", "/", $data['currpath']);

     $json = recursive_dir_listing($data['currpath']);

     foreach ($json as $value) {
          if (is_dir($value) == false  && $value != "." && $value != "..") {
	          $val = abs(time()-filemtime($value))/60/60/24;

               if ( $val <= $interval) {
                    array_push($modified,str_replace($data['currpath'], "", $value));
               }
	     }
     }
      
     echo json_encode($modified);
?>

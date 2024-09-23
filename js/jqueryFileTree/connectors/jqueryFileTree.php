<?php
//
// jQuery File Tree PHP Connector
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// Output a list of files for jQuery File Tree
//

error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

if ( PHP_OS == "WINNT" ) {
     $delimiter="\\";
} else {
     $delimiter="/";
}

// Get path to music based on relative path of current script (..\..\..\Music on Windows based servers or ../../../Music on *nix/Mac)
$music_path=substr(__FILE__,0,strrpos(__FILE__,$delimiter)); //  Current folder
$music_path=substr($music_path,0,strrpos($music_path,$delimiter)); // 1 folder up
$music_path=substr($music_path,0,strrpos($music_path,$delimiter)); // 1 folder up
$music_path=substr($music_path,0,strrpos($music_path,$delimiter)) . $delimiter . "Music" . $delimiter; // 1 folder up then add Music
	
$root="";

if (isset($_POST['dir'])) {
	$dir = $_POST['dir'];
} else if (isset($_GET['dir'])) {
	$dir = $_GET['dir'];
} else {
	$html = $html . "<ul id=\"jqueryFileTree\" class=\"jqueryFileTree\" style=\"display: none;\"></ul";

	die($html);	
}

// decode all of the dirs provided. Since I moved the php script to a /php subdirectory, we need to remove /php from the path
$dir = urldecode($dir);


$html = "";

if( file_exists($root . $dir) ) {
	 $files = scandir($root . $dir);
	
	 // Sort directory so .. is always first. FIxes issue with directory that begins with ' (single apostrophe)
	 usort($files, function($a, $b) {
		  if ($a === '..') {
			   return -1; // Move ".." to the front
		  }

		  if ($b === '..') {
			   return 1; // Keep all other items behind ".."
		  }

		  return 0; // Keep the order for other elements
 	 });

	 // When there are only 2 files (. and ..) and we are not in the root directory, add ..
	 if (count($files) == 2 && $root . $dir <> $music_path ) {
		  $html = $html . "<ul id=\"jqueryFileTree\" class=\"jqueryFileTree\" style=\"display: none;\">";
		  $html = $html . "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($dir . "..") . $delimiter . "\">" . htmlentities("..") . "</a></li>";
		  $html = $html . "</ul>";

		  echo $html;
	 } elseif( count($files) > 2 ) {
		  $html = $html . "<ul  id=\"jqueryFileTree\" class=\"jqueryFileTree\" style=\"display: none;\">";

          // Use Boolean to determine if the current folder has any files
          $hasFiles=FALSE;

          foreach ( $files as $file2 ) {
               if ( !is_dir($root . $dir . $file2) && in_array(strtolower(substr($file2,-3)),array( 'mp3','m4a','aac'))) $hasFiles=TRUE;
          }

		  foreach( $files as $file ) {
			   if( file_exists($root . $dir . $file) && $file != '.' && is_dir($root . $dir . $file) ) {
			        if ( ($root . $dir . $file) <> $music_path . "..") { // If we are in the root dir ($music_path) do not add .. directory
						$html = $html . "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($dir . $file) . $delimiter . "\">" . htmlentities($file) . ($file == ".." && $hasFiles == true ? "<div class='actions'><a class='addAllTracks' rel='" . urlencode($dir) . "'>add all" : "" ) . "</a></li>";
				    }
			   }
		  }
		
		  // All files
		  foreach( $files as $file ) {
		       if( file_exists($root . $dir . $file) && $file != '.' && $file != '..' && !is_dir($root . $dir . $file) && in_array(strtolower(substr($file,-3)),array( 'mp3','m4a','aac'))) {
			        $ext = preg_replace('/^.*\./', '', $file);
				
				    if ( $_POST["Type"] <> "Dir") {
						$html = $html . "<li class='track'><a href=\"#\" rel=\"" . $dir . $file . "\">" . $file . "<div class='actions'><a class='add' rel='" . $dir . $file . "'>add</a></div></li>";
				    }
			   }
		  }
		
		  $html = $html . "</ul>";

		  echo $html;
	 }
}

?>
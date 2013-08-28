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

// decode all of the dirs provided
$_POST['dir'] = urldecode($_POST['dir']);

if( file_exists($root . $_POST['dir']) ) {
	
	 $files = scandir($root . $_POST['dir']);
	
	 natcasesort($files);
	
	 // When there are only 2 files (. and ..) and we are not in the root directory, add ..
	 if ( count($files) == 2 && $root . $_POST['dir'] <> $music_path ) {
		  echo "<ul id=\"jqueryFileTree\" class=\"jqueryFileTree\" style=\"display: none;\">";
		  echo "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($_POST['dir'] . $files[1]) . $delimiter . "\">" . htmlentities($files[1]) . "</a></li>";
		  echo "</ul>";
	 } elseif( count($files) > 2 ) {
		  echo "<ul  id=\"jqueryFileTree\" class=\"jqueryFileTree\" style=\"display: none;\">";

          // Use Boolean to determine if the current folder has any files
          $hasFiles=FALSE;

          foreach ( $files as $file2 ) {
               if ( !is_dir($root . $_POST['dir'] . $file2) && in_array(strtolower(substr($file2,-3)),array( 'mp3','m4a','aac'))) $hasFiles=TRUE;
          }
		  
		  // All dirs
		  foreach( $files as $file ) {
			   if( file_exists($root . $_POST['dir'] . $file) && $file != '.' && is_dir($root . $_POST['dir'] . $file) ) {		
			        if ( ($root . $_POST['dir'] . $file) <> $music_path . "..") { // If we are in the root dir ($music_path) do not add .. directory
					     // When $hasfile == true, add the add all tracks link                         
						 echo "<li class=\"directory collapsed\"><a href=\"#\" rel=\"" . htmlentities($_POST['dir'] . $file) . $delimiter . "\">" . htmlentities($file) . ($file == ".." && $hasFiles == true ? "<div class='actions'><a class='addAllTracks' rel='" . urlencode($_POST['dir']) . "'>add all" : "" ) . "</a></li>";
				    }
			   }
		  }
		
		  // All files
		  foreach( $files as $file ) {
		       if( file_exists($root . $_POST['dir'] . $file) && $file != '.' && $file != '..' && !is_dir($root . $_POST['dir'] . $file) && in_array(strtolower(substr($file,-3)),array( 'mp3','m4a','aac'))) {
			        $ext = preg_replace('/^.*\./', '', $file);
				
				    if ( $_POST["Type"] <> "Dir") {
					     echo "<li class='track'><a href=\"#\" rel=\"" . $_POST['dir'] . $file . "\">" . $file . "<div class='actions'><a class='add' rel='" . $_POST['dir'] . $file . "'>add</a></div></li>";
				    }
			   }
		  }
		
		  echo "</ul>";	
	 }
}

?>
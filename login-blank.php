<?php

// Change this to your own Mysql Login info
$database_username="";
$database_password="";
$database_host="";
$database_name="";
$table_name="";
$user_auth_table="";

// Try to connect
$mms_connect = new mysqli($database_host,$database_username,$database_password,$database_name); 

// Make sure DB connect worked
if ( !$mms_connect) {
     errorOccured("Connection to DB failed");
}
     
// I include this here because all my php scripts include login.php anyway
function errorOccured($str) {
     $json['error'] = $str;
     die(json_encode($json));
}
?>

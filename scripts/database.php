<?php 

$servername = "localhost";
$username = "luigi";
$password = "dupadupowata";
$dbname = "mockdata";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

 $sql = "select * from livingroomtemp";
 
 $res = mysqli_query($conn,$sql);
 
 $result = array();
 
 while($row = mysqli_fetch_array($res)){
 array_push($result, 
 array('id'=>$row[0],'data'=>$row[1],'time'=>$row[2],'temp'=>$row[3],'dummy1'=>$row[4],'dummy2'=>$row[5]));
 }
 
 echo json_encode(array('result'=>$result));
?>
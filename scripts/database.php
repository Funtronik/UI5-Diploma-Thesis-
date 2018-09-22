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
 $resultTemperatures = array();
 
 while($row = mysqli_fetch_array($res)){
 	array_push($resultTemperatures, 
 	array('id'=>$row[0],'data'=>$row[1],'time'=>$row[2],'temp'=>$row[3],'dummy1'=>$row[4],'dummy2'=>$row[5]));
 }
//  clearSQL();

//  $sql = "select * from lights";
//  $res = mysqli_query($conn,$sql);
//  $resultLights = array();
//  while($row = mysqli_fetch_array($res)){
// 	array_push($resultLights, 
// 	array('id'=>$row[0],'name'=>$row[1],'state'=>$row[2],'changed'=>$row[3]));
// }

 echo json_encode(array('temperatures'=>$resultTemperatures)); //, 'lights'=>$resultLights

function clearSQL() {
	$res = "";
	$sql = "";	
					}
?>
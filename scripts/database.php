<?php 

$servername = "192.168.1.65";
$username = "luigi";
$password = "raspberry";
$dbname = "MyHome";
$resultTemperatures = array();
$resultLights = array();

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
function getDataFromDatabase(){
	//temps
 	$sql = "select * from temperatures";
 	$res = mysqli_query($conn,$sql);

 
	 while($row = mysqli_fetch_array($res)){
 		array_push($resultTemperatures, 
 		array('id'=>$row[0],'data'=>$row[1],'time'=>$row[2],'temp'=>$row[3],'dummy1'=>$row[4],'dummy2'=>$row[5]));
	 }
 	clearSQL();
	//lights
 	$sql = "select * from lights";
 	$res = mysqli_query($conn,$sql);

 	while($row = mysqli_fetch_array($res)){
		array_push($resultLights, 
		array('id'=>$row[0],'name'=>$row[1],'state'=>$row[2],'changed'=>$row[3]));
	}
}
function updateLight($lightname){
	$sql = "update lights set state = !state, * where name ='"+ $lightname + "'";
 	$res = mysqli_query($conn,$sql);
}
function clearSQL() {
	$res = "";
	$sql = "";	
					}



 echo json_encode(array('temperatures'=>$resultTemperatures,'lights'=>$resultLights)); 


?>
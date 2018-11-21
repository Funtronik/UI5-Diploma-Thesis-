<?php 

$servername = "192.168.1.80";
//$servername = "localhost";
$username = "luigi";
$password = "raspberry";
$dbname = "MyHome";
$resultTemperatures = array();
$resultLights = array();
$res = null;
$sql = null;
$conn = null;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
function getDataFromDatabase(){
	global $resultTemperatures, $sql, $res, $resultLights, $conn;
	//temps
 	$sql = "select * from temperatures";
 	$res = mysqli_query($conn,$sql);

	 while($row = mysqli_fetch_array($res)){
 		array_push($resultTemperatures, 
 		array('id'=>$row[0],'data'=>$row[1],'time'=>$row[2],'temp'=>$row[3],'dummy1'=>$row[4],'dummy2'=>$row[5]));
	 }
	 clearSQL();

	//something else
}
function clearSQL() {
	global $res, $sql;
	$res = "";
	$sql = "";	
					}

getDataFromDatabase();
echo json_encode(array('temperatures'=>$resultTemperatures)); 


?>
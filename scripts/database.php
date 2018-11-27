<?php 

$servername = "192.168.1.80";
//$servername = "localhost";
$username = "luigi";
$password = "raspberry";
$dbname = "MyHome";
$resultRoomTemperatures = array();
$resultOutsideTemperatures = array();
$res = null;
$sql = null;
$conn = null;
$date = date("Y-m-d");

function getDataFromDatabase(){
	global $resultRoomTemperatures, $resultOutsideTemperatures, $sql, $res, $conn, $date;

 	$sql = "SELECT id, date, time, temp, hum, dummy2 FROM roomtemperatures WHERE date = CURDATE() ORDER BY date asc, time asc";
 	$res = mysqli_query($conn,$sql);

	 while($row = mysqli_fetch_array($res)){
 		array_push($resultRoomTemperatures, 
 		array('id'=>$row[0],'date'=>$row[1],'time'=>$row[2],'temp'=>$row[3],'hum'=>$row[4],'dummy2'=>$row[5]));
	 }
	 
	$sql = "SELECT id, date, time, temp, hum, dummy2 FROM outsidetemperatures WHERE date= CURDATE() ORDER BY date asc, time asc";
 	$res = mysqli_query($conn,$sql);

	 while($row = mysqli_fetch_array($res)){
 		array_push($resultOutsideTemperatures, 
 		array('id'=>$row[0],'date'=>$row[1],'time'=>$row[2],'temp'=>$row[3],'hum'=>$row[4],'dummy2'=>$row[5]));
	 }
	 clearSQL();
	 mysqli_close($conn);
}
function clearSQL() {
	global $res, $sql;
	$res = null;
	$sql = "";	
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
getDataFromDatabase();

$dataToJson = array();
$dataToJson['RoomTemperatures'] = $resultRoomTemperatures;
$dataToJson['OutsideTemperatures'] = $resultOutsideTemperatures;
echo json_encode($dataToJson); 

?>
<?php

$servername = "";
$username = "luigi";
$password = "raspberry";
$dbname = "MyHome";
$resultRoomTemperatures = array();
$resultOutsideTemperatures = array();
$res = null;
$sql = null;
$conn = null;
$date = date("Y-m-d");

class CheckDevice {

	public function myOS(){
		if (strtoupper(substr(PHP_OS, 0, 3)) === (chr(87).chr(73).chr(78)))
			return true;

		return false;
	}

	public function ping($ip_addr){
		if ($this->myOS()){
			if (!exec("ping -n 1 -w 1 ".$ip_addr." 2>NUL > NUL && (echo 0) || (echo 1)"))
				return true;
		} else {
			if (!exec("ping -q -c1 ".$ip_addr." >/dev/null 2>&1 ; echo $?"))
				return true;
		}
		return false;
	}
}

$ip_addr = "192.168.1.80";
if ((new CheckDevice())->ping($ip_addr))
	$servername = "192.168.1.80";
else
	$servername = "localhost";

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
function checkIfDataFetched(){
	global $resultOutsideTemperatures, $resultRoomTemperatures;

	if (count($resultOutsideTemperatures) == 0)
	{
		array_push($resultOutsideTemperatures,
		array('id'=>"1",'date'=>"01.01.1990",'time'=>"12:00:00",'temp'=>"30",'hum'=>"20",'dummy2'=>"..."));
	}
	if (count($resultRoomTemperatures) == 0)
	{
		array_push($resultRoomTemperatures,
		array('id'=>"1",'date'=>"01.01.1990",'time'=>"12:00:00",'temp'=>"30",'hum'=>"20",'dummy2'=>"..."));
	}
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}
getDataFromDatabase();
checkIfDataFetched();

$dataToJson = array();
$dataToJson['RoomTemperatures'] = $resultRoomTemperatures;
$dataToJson['OutsideTemperatures'] = $resultOutsideTemperatures;
echo json_encode($dataToJson);

?>
<?php

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

	// SQL does not accept parameters and so is not prepared.
	// $_REQUEST used for development / debugging. Remember to change to $_POST for production.

	$query = $conn->prepare('SELECT COUNT(*) FROM department WHERE locationID = ?');
	$secondquery = $conn->prepare('DELETE FROM location WHERE id = ?');

	$query->bind_param('i', $_REQUEST['param1']);
	$secondquery->bind_param('i', $_REQUEST['param1']);
	
	$query->execute();
	
	if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}

	$result = $query->bind_result($count);

	while ($query->fetch()) {
		$data = $count;
	};

	if ($count > 0) {

	$output['status']['code'] = "401";
	$output['status']['name'] = "unauthorised";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = nl2br("<strong>Deletion Denied!</strong>This location has " . $data . " department(s) attached to it");
	
	mysqli_close($conn);

	echo json_encode($output); 

	} else {

	$secondquery->execute();
	
	if (false === $secondquery) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = ["The " . $_REQUEST['param2'] . " office has been successfully deleted"];
	
	mysqli_close($conn);

	echo json_encode($output); 
	
	}
	
?>
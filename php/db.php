<?php
try{
	$servername = "SERVER_DB";
	$username = "USER_DB";
	$password = "PASS_DB";
	$dbname = "NOME_DB";

	$conn = new mysqli($servername, $username, $password, $dbname);

	if ($conn->connect_error) {
		http_response_code(503);
		echo json_encode([
			"error" => "Si è verificato un errore interno",
			"errorData" => [
				"status" => 503,
				"errorInfo" => "Connessione al db fallita ".$conn->connect_error
			]
		]);
		exit;
	}
} catch (Exception $ex) {
	http_response_code(503);
	echo json_encode([
			"error" => "Si è verificato un errore interno",
			"errorData" => [
				"status" => 503,
				"errorInfo" => "Connessione al db fallita ".$ex
			]
		]);
	exit;
}
?>
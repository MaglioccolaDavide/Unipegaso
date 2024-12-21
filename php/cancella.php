<?php
// Importa i file necessari
include_once 'db.php';

// Verifica se il metodo è POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito. Usa POST."]);
    exit;
}

// Recupera i parametri passati
$email = $codice = $_data = $ora = $nome = "";
$data = json_decode(file_get_contents("php://input"), true);

// Verifica se sono presenti tutti i parametri
if (!isset($data['email']) || !isset($data['codice'])) {
    http_response_code(400);
    echo json_encode(["error" => "Campi mancanti"]);
    exit;
}

// Valida i dati secondo i criteri impostati
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$codice = filter_var($data['codice'], FILTER_VALIDATE_INT);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); 
    echo json_encode(["error" => "Email non valida."]);
    exit;
}

if (strlen($codice) !== 8) {
    http_response_code(400);
    echo json_encode(["error" => "Codice non valido."]);
    exit;
}


try {
	// Verifica presenza nel db i dati
	$stmt = $conn->prepare("SELECT id, data, ora, nome FROM prenotazioni WHERE email = ? AND codice = ?");
	$stmt->bind_param("si", $email, $codice);
	$stmt->execute();
	$result = $stmt->get_result();
	if($result->num_rows > 0) {
		$row = $result->fetch_assoc();
		try {
			$stmts = $conn->prepare("DELETE FROM prenotazioni WHERE id = ?");
			$stmts->bind_param("i", $row['id']);
			$stmts->execute();
			$stmts->close();
		} catch (Exception $ex) {
			http_response_code(503);
			echo json_encode([
				"error" => "Errore durante l'eliminazione dal db",
				"errorData" => [
					"status" => 503,
					"errorInfo" => $ex
				]
			]);
			exit;
		}
		http_response_code(200);
		echo json_encode([
			"message" => "Cancellazione effettuata con successo!",
			"data" => [
				"data" => date_format(date_create($row['data']),"d/m/Y"),
				"ora" => date_format(date_create($row['ora']),"H:i"),
				"nome" => $row['nome']
			]
		]);
		exit;
	} else {
		http_response_code(400);
		echo json_encode(["error" => "Codice e/o email non validi."]);
		exit;
	}
	$stmt->close();
	$conn->close();
} catch (Exception $ex) {
	// Risponde al fetch con errore
	http_response_code(503);
	echo json_encode([
		"error" => "Errore durante la verifica nel db",
		"errorData" => [
			"status" => 503,
			"errorInfo" => $ex
		]
	]);
	exit;
}
?>
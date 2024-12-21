<?php
// Importa i file necessari
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';
include_once 'db.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Crea un'istanza di PHPMailer
$mail = new PHPMailer(true);


// Verifica se il metodo è POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Metodo non consentito. Usa POST."]);
    exit;
}

// Recupera i parametri passati
$email = $nome = $codice = $data = $ora = $ospiti = $nOspiti = "";
$data = json_decode(file_get_contents("php://input"), true);

// Verifica se sono presenti tutti i parametri
if (!isset($data['email']) || !isset($data['nome']) || !isset($data['data']) || !isset($data['ora']) || !isset($data['ospiti'])) {
    http_response_code(400);
    echo json_encode(["error" => "Campi mancanti"]);
    exit;
}

// Valida i dati secondo i criteri impostati
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$nome = $data['nome'];
$_data = $data['data'];
$ora = $data['ora'];
$ospiti = filter_var($data['ospiti'], FILTER_VALIDATE_INT);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400); 
    echo json_encode(["error" => "Email non valida."]);
    exit;
}

if (strlen(trim($nome)) < 1) {
    http_response_code(400);
    echo json_encode(["error" => "Il campo nome non può essere vuoto."]);
    exit;
}

if ($ospiti < 1 || $ospiti > 8) {
    http_response_code(400);
    echo json_encode(["error" => "Il numero di ospiti deve essere compreso tra 1 e 8."]);
    exit;
}

if($ospiti == 1) {
	$nOspiti = "1 ospite";
} else {
	$nOspiti = $ospiti." ospiti";
}

try {
	$itData = explode('/', $_data);
	$enData = $itData[2].'-'.$itData[1].'-'.$itData[0];
	
	// Inserisce nel db i dati
	$stmt = $conn->prepare("INSERT INTO prenotazioni (data, ora, email, nome, ospiti) VALUES (?, ?, ?, ?, ?)");
	$stmt->bind_param("ssssi", $enData, $ora, $email, $nome, $ospiti);
	$stmt->execute();
	$id = $conn->insert_id;
	//echo json_encode(["error" => "id: ".$id]);
	$stmt->close();	
	
	if($id > 0) {
		// Genera il codice
		$stmts = $conn->prepare("Select GeneraCodice(?)");
		$stmts->bind_param("i", $id);
		$stmts->execute();
		$result = $stmts->get_result();
		$row = $result->fetch_array(MYSQLI_ASSOC);
		$codice = $row['GeneraCodice(?)'];	
		$stmts->close();
	} else {
		http_response_code(503);
		echo json_encode(["error" => "ID non valido."]);
		exit;
	}
	$conn->close();
} catch (Exception $ex) {
	// Risponde al fetch con errore
	http_response_code(503);
	echo json_encode([
		"error" => "Errore durante l'inserimento nel db",
		"errorData" => [
			"status" => 503,
			"errorInfo" => $ex
		]
	]);
	exit;
}

// Importa il template sotto forma di stringa
$template  = file_get_contents('mailBody.php'); 

// Inietta i dati raccolti nel template
$messaggio = str_replace('{$codice}', $codice, 
			 str_replace('{$nome}', $nome, 
			 str_replace('{$ospiti}', $nOspiti, 
			 str_replace('{$data}', $_data, 
			 str_replace('{$ora}', $ora, $template)))));

try {
    // Configurazione del server SMTP
    $mail->isSMTP();
    $mail->Host = 'smtps.aruba.it'; // Indirizzo del server SMTP
    $mail->SMTPAuth = true;              // Abilita l'autenticazione SMTP
    $mail->Username = 'noreply@maglioccoladavide.it';    // Nome utente SMTP
    $mail->Password = 'PASSWORD_DA_CAMBIARE';    // Password SMTP
    $mail->SMTPSecure = 'ssl';           // Abilita TLS (o `ssl` se il server lo richiede)
    $mail->Port = 465;                   // Porta SMTP (465 per SSL, 587 per TLS)
	$mail->isHTML(true);

    // Impostazioni dell'email
    $mail->setFrom('noreply@maglioccoladavide.it', 'NoReply - Maglioccola Davide');
    $mail->addAddress($email);
    $mail->Subject = '[Villa Inventata] Conferma di avvenuta prenotazione';
    $mail->Body    = rawurldecode($messaggio);

    // Invia l'email
    $mail->send();
		
	// Risponde al fetch con successo
    http_response_code(200);
	echo json_encode([
		"message" => "Prenotazione effettuata con successo!",
		"data" => [
			"email" => $email,
			"nome" => $nome,
			"data" => $data,
			"ora" => $ora,
			"ospiti" => $ospiti
		]
	]);
	exit;
} catch (Exception $e) {
	// Risponde al fetch con errore
	http_response_code(503);
	echo json_encode([
		"error" => "Errore durante l'invio dell'email",
		"errorData" => [
			"status" => 503,
			"errorInfo" => $mail->ErrorInfo
		]
	]);
	exit;
}
?>
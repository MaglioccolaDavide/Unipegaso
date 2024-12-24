<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Prenota {
    private $conn;
    private $mail;

    public function __construct($dbConnection) {
        $this->conn = $dbConnection;
        $this->mail = new PHPMailer(true);
    }
	
	public function verificaRichiesta() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->inviaRisposta(405, ["error" => "Metodo non consentito. Usa POST."]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$this->validaInput($data)) {
            return;
        }

        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $nome = $data['nome'];
        $_data = $data['data'];
        $ora = $data['ora'];
        $ospiti = filter_var($data['ospiti'], FILTER_VALIDATE_INT);

        if (!$this->validaEmail($email) || !$this->validaNome($nome) || !$this->validaOspiti($ospiti)) {
            return;
        }
		
		if($ospiti == 1) {
			$nOspiti = "1 ospite";
		} else {
			$nOspiti = $ospiti." ospiti";
		}

        try {
            $codice = $this->inserisciPrenotazione($email, $nome, $_data, $ora, $ospiti);
            $this->inviaEmail($email, $nome, $nOspiti, $_data, $ora, $codice);
            $this->inviaRisposta(200, [
                "message" => "Prenotazione effettuata con successo!",
                "data" => [
					"email" => $email,
					"nome" => $nome,
					"data" => $data,
					"ora" => $ora,
					"ospiti" => $ospiti
				]
            ]);
        } catch (Exception $e) {
            $this->inviaRisposta(503, [
                "error" => "Si è verificato un errore interno.",
                "errorData" => [
					"status" => 503,
					"errorInfo" => $e
				]
            ]);
        }
    }

    private function validaInput($data) {
        if (!isset($data['email'], $data['nome'], $data['data'], $data['ora'], $data['ospiti'])) {
            $this->inviaRisposta(400, ["error" => "Campi mancanti"]);
            return false;
        }
        return true;
    }
	
	private function validaEmail($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->inviaRisposta(400, ["error" => "Email non valida."]);
            return false;
        }
        return true;
    }
	
	private function validaNome($nome) {
        if (strlen(trim($nome)) < 1) {
            $this->inviaRisposta(400, ["error" => "Il campo nome non può essere vuoto."]);
            return false;
        }
        return true;
    }
	
	private function validaOspiti($ospiti) {
        if ($ospiti < 1 || $ospiti > 8) {
            $this->inviaRisposta(400, ["error" => "Il numero di ospiti deve essere compreso tra 1 e 8."]);
            return false;
        }
        return true;
    }

    private function inserisciPrenotazione($email, $nome, $_data, $ora, $ospiti) {
        try {
            $itData = explode('/', $_data);
            $enData = $itData[2] . '-' . $itData[1] . '-' . $itData[0];

            $stmt = $this->conn->prepare("INSERT INTO prenotazioni (data, ora, email, nome, ospiti) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssi", $enData, $ora, $email, $nome, $ospiti);
            $stmt->execute();
            $id = $this->conn->insert_id;
            $stmt->close();

            if ($id > 0) {
                return $this->generaCodice($id);
            } else {
				$this->inviaRisposta(503, ["error" => "ID non valido."]);
            }
        } catch (Exception $ex) {
			$this->inviaRisposta(503, [
                "error" => "Errore durante l'inserimento nel db",
                "errorData" => [
					"status" => 503,
					"errorInfo" => $ex
				]
            ]);
        }
    }

    private function generaCodice($id) {
		try {
			$stmt = $this->conn->prepare("SELECT GeneraCodice(?)");
			$stmt->bind_param("i", $id);
			$stmt->execute();
			$result = $stmt->get_result();
			$row = $result->fetch_array(MYSQLI_ASSOC);
			$stmt->close();
			return $row['GeneraCodice(?)'];
		} catch (Exception $ex) {
			$this->inviaRisposta(503, [
                "error" => "Errore durante la generazione del codice",
                "errorData" => [
					"status" => 503,
					"errorInfo" => $ex
				]
            ]);
        }
		return false;
    }

    private function inviaEmail($email, $nome, $nOspiti, $_data, $ora, $codice) {
        $template = file_get_contents('mailBody.php');
        $messaggio = str_replace(
            ['{$codice}', '{$nome}', '{$ospiti}', '{$data}', '{$ora}'],
            [$codice, $nome, $nOspiti, $_data, $ora],
            $template
        );

        try {
            $this->mail->isSMTP();
            $this->mail->Host = 'smtps.aruba.it';
            $this->mail->SMTPAuth = true;
            $this->mail->Username = 'noreply@maglioccoladavide.it';
            $this->mail->Password = 'PASSWORD_DA_CAMBIARE';
            $this->mail->SMTPSecure = 'ssl';
            $this->mail->Port = 465;
            $this->mail->isHTML(true);

            $this->mail->setFrom('noreply@maglioccoladavide.it', 'NoReply - Maglioccola Davide');
            $this->mail->addAddress($email);
            $this->mail->Subject = '[Villa Inventata] Conferma di avvenuta prenotazione';
            $this->mail->Body = rawurldecode($messaggio);

            $this->mail->send();
        } catch (Exception $e) {
			$this->inviaRisposta(503, [
                "error" => "Errore durante l'invio dell'email",
                "errorData" => [
					"status" => 503,
					"errorInfo" => $e
				]
            ]);
        }
    }

    private function inviaRisposta($stato, $data) {
        http_response_code($stato);
        echo json_encode($data);
        exit;
    }
}

require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';
include_once 'db.php';

$Prenota = new Prenota($conn);
$Prenota->verificaRichiesta();
?>

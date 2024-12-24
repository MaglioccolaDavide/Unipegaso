<?php
class CancellaPrenotazione {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
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
        $codice = filter_var($data['codice'], FILTER_VALIDATE_INT);

        if (!$this->validaEmail($email) || !$this->validaCodice($codice)) {
            return;
        }

        $this->verificaPrenotazione($email, $codice);
    }

    private function validaInput($data) {
        if (!isset($data['email']) || !isset($data['codice'])) {
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

    private function validaCodice($codice) {
        if (strlen($codice) !== 8) {
            $this->inviaRisposta(400, ["error" => "Codice non valido."]);
            return false;
        }
        return true;
    }

    private function verificaPrenotazione($email, $codice) {
        try {
            $stmt = $this->conn->prepare("SELECT id, data, ora, nome FROM prenotazioni WHERE email = ? AND codice = ?");
            $stmt->bind_param("si", $email, $codice);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $this->rimuoviPrenotazione($row['id'], $row);
            } else {
                $this->inviaRisposta(400, ["error" => "Codice e/o email non validi."]);
            }

            $stmt->close();
        } catch (Exception $ex) {
            $this->inviaRisposta(503, [
                "error" => "Errore durante la verifica nel db",
                "errorData" => [
					"status" => 503,
					"errorInfo" => $ex
				]
            ]);
        }
    }

    private function rimuoviPrenotazione($id, $row) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM prenotazioni WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();

            $this->inviaRisposta(200, [
                "message" => "Cancellazione effettuata con successo!",
                "data" => [
                    "data" => date_format(date_create($row['data']), "d/m/Y"),
                    "ora" => date_format(date_create($row['ora']), "H:i"),
                    "nome" => $row['nome']
                ]
            ]);
        } catch (Exception $ex) {
            $this->inviaRisposta(503, [
                "error" => "Errore durante l'eliminazione dal db",
                "errorData" => [
					"status" => 503,
					"errorInfo" => $ex
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

include_once 'db.php'; 
$CancellaPrenotazione = new CancellaPrenotazione($conn);
$CancellaPrenotazione->verificaRichiesta();
?>

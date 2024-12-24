<?php
class VerificaPrenotazioni {
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

        $_data = $data['data'];

        $this->verificaDati($_data);
    }
	
	private function validaInput($data) {
        if (!isset($data['data'])) {
            $this->inviaRisposta(400, ["error" => "Campi mancanti"]);
            return false;
        }
        return true;
    }

    private function verificaDati($_data) {
        try {
            $stmt = $this->conn->prepare("SELECT COUNT(*), ora, data FROM prenotazioni WHERE data BETWEEN DATE_FORMAT(?, '%Y-%m-01') AND LAST_DAY(?) GROUP BY data, ora ORDER BY data, ora ASC");
            $stmt->bind_param("ss", $_data, $_data);
            $stmt->execute();
			$result = $stmt->get_result();

           if ($result->num_rows > 0) {
				$rows = [];

				while ($row = $result->fetch_assoc()) {
					$rows[] = [
						"count" => $row['COUNT(*)'],
						"ora" => $row['ora'],
						"data" => $row['data']
					];
				}

				$this->inviaRisposta(200, [
					"message" => "Sono presenti dati",
					"data" => [
						"data" => $_data,
						"prenotazioni" => $rows
					]
				]);
			} else {
				$this->inviaRisposta(200, [
					"message" => "Nessun dato trovato",
					"data" => [
						"data" => $_data,
						"prenotazioni" => []
					]
				]);
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

    private function inviaRisposta($stato, $data) {
        http_response_code($stato);
        echo json_encode($data);
        exit;
    }
}

include_once 'db.php'; 
$VerificaPrenotazioni = new VerificaPrenotazioni($conn);
$VerificaPrenotazioni->verificaRichiesta();
?>

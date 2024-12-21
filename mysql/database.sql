-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Dic 18, 2024 alle 08:41
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prenotazioni`
--

DELIMITER $$
--
-- Funzioni
--
CREATE FUNCTION `GeneraCodice` (`p_id` INT) RETURNS INT(8) DETERMINISTIC BEGIN
    DECLARE _codice INT(8);
    DECLARE codiceEsiste INT DEFAULT 1;

    -- Genera un codice casuale e verifica se esiste nella tabella
    WHILE codiceEsiste = 1 DO
        SET _codice = FLOOR(RAND() * (99999999 - 10000000 + 1) + 10000000);

        -- Controlla se il codice esiste già
        SELECT COUNT(*) INTO codiceEsiste
        FROM prenotazioni
        WHERE codice = _codice;
    END WHILE;

    -- Inserisce il codice generato nel record con l'ID specificato
    UPDATE prenotazioni
    SET codice = _codice
    WHERE id = p_id;

    -- Ritorna il codice generato
    RETURN _codice;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struttura della tabella `prenotazioni`
--

CREATE TABLE `prenotazioni` (
  `id` int(11) NOT NULL,
  `data` date NOT NULL,
  `ora` time NOT NULL,
  `email` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `ospiti` tinyint(1) NOT NULL,
  `codice` int(8) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `prenotazioni`
--
ALTER TABLE `prenotazioni`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `prenotazioni`
--
ALTER TABLE `prenotazioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

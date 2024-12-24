class Calendario {
    constructor(contenitore) {
        this.contenitore = document.querySelector(contenitore);
        this.oggi = new Date(); // data odierna 
        this.meseCorrente = this.oggi.getMonth(); // mese corrente
        this.annoCorrente = this.oggi.getFullYear(); // anno corrente
        this.annoMassimo = this.annoCorrente + 2; // 2 anni nel futuro a partire da oggi
        this.nomiMesi = [ "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" ]; // array nomi mesi
		this.orari = ["12:00", "12:30", "13:00", "13:30", "14:00", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
		this.prenotazioniMassime = 1;

		this.prenotazioni = {};
		this.prenotazioniRandom = {};
		
        this.inizializza();
    }
	
	formattaData(data, formato) {
		var yyyy = 0;
		var mm = 0;
		var dd = 0;
		var dataFormattata = data;
		
		if(data instanceof Date && !isNaN(data.getTime())) { // se la data è già un oggetto data
			yyyy = data.getFullYear(); // ottengo anno per esteso dalla data selezionata
			mm = data.getMonth() + 1; // ottengo mese dalla data selezionata, +1 perchè mese parte da 0
			dd = data.getDate(); // ottengo giorno dalla data selezionata
		}

		if(typeof data === "string") { // se la data è una stringa
			data = data.trim();

			const formatoDMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/; // dd/mm/yyyy
			const formatoYMD = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;   // yyyy-mm-dd

			let match;

			if((match = data.match(formatoDMY))) {
				dd = parseInt(match[1], 10);
				mm = parseInt(match[2], 10);
				yyyy = parseInt(match[3], 10);
			} 
			else if((match = data.match(formatoYMD))) {
				yyyy = parseInt(match[1], 10);
				mm = parseInt(match[2], 10);
				dd = parseInt(match[3], 10);
			}
		}
		
		if(formato == "dmY") {
			dataFormattata = dd + '/' + mm + '/' + yyyy; // riposiziono secondo formato italiano
		} else if(formato == "Ymd") {
			dataFormattata = yyyy + '-' + mm + '-' + dd; // riposiziono secondo formato inglese
		}
		else if(formato == "m") {
			dataFormattata = mm; // estraggo il mese
		}
		return dataFormattata;
	}

    inizializza() {
        this.contenitore.innerHTML = `
			<div class="intestazione">
                <button class="mese-precedente"><</button>
                <div class="mese-anno"></div>
                <button class="mese-successivo">></button>
            </div>
            <div class="giorni-settimana">
                <div class="col">Lun</div>
                <div class="col">Mar</div>
                <div class="col">Mer</div>
                <div class="col">Gio</div>
                <div class="col">Ven</div>
                <div class="col">Sab</div>
                <div class="col">Dom</div>
            </div>
            <div id="giorni" class="giorni"></div>
        `;

        this.contenitore.querySelector('.mese-precedente').addEventListener('click', () => this.mesePrec()); // listner click mese precedente
        this.contenitore.querySelector('.mese-successivo').addEventListener('click', () => this.meseSucc()); // listner click mese successivo

        this.renderCalendario();
		this.gestisciFormPrenotazione();
		this.gestisciFormCancellazione();
    }

    renderCalendario() {
        const meseAnnoEl = this.contenitore.querySelector('.mese-anno');
        const giorniEl = this.contenitore.querySelector('.giorni');

        meseAnnoEl.textContent = `${this.nomiMesi[this.meseCorrente]} ${this.annoCorrente}`;

        const primoGiorno = (new Date(this.annoCorrente, this.meseCorrente, 1).getDay() + 6) % 7; // numero del primo giorno del mese sulla settimana
        const giorniNelMese = new Date(this.annoCorrente, this.meseCorrente + 1, 0).getDate(); // numero di giorni del mese
		this.verificaPrenotazioni(this.formattaData(new Date(this.annoCorrente, this.meseCorrente + 1, 0), "Ymd")); // recupero le prenotazioni del mese corrente
		
        giorniEl.innerHTML = '';

        for (var i = 0; i < primoGiorno; i++) { // creo div vuoti finchè non incontro il primo giorno del mese e li aggiungo all'elemento contenitore
            const vuoto = document.createElement('div');
            vuoto.classList.add('col');
            giorniEl.appendChild(vuoto);
        }

        for (var i = 1; i <= giorniNelMese; i++) { // aggiungo i giorni all'elemento contenitore
			const giornoData = new Date(this.annoCorrente, this.meseCorrente, i);
            const giornoEl = document.createElement('div');			
            giornoEl.classList.add('col');
			
			if (giornoData < new Date(this.oggi.setHours(0, 0, 0, 0))) { // se il giorno del loop è inferiore al giorno attuale aggiungo la classe disabilitato
				giornoEl.classList.add('disabilitato');
			}
									
			if (giornoData.toDateString() === new Date().toDateString()) { // se il giorno del loop è uguale al giorno attuale aggiungo la classe oggi
				giornoEl.classList.add('selezionato');
			}

			if (giornoData.getDay() === 0 || giornoData.getDay() === 6) { // se il giorno del loop è sabato o domenica aggiungo la classe fine-settimana
				giornoEl.classList.add('fine-settimana');
			}
									
			giornoEl.textContent = i;
			giornoEl.dataset.data = `${i}/${this.meseCorrente + 1}/${this.annoCorrente}`; // imposto un attributo al div nel formato dd/mm/yyyy
			giornoEl.addEventListener('click', () => this.selezionaGiorno(giornoEl)); // aggiungo un listener al click sul div
            giorniEl.appendChild(giornoEl);
        }
    }

    meseSucc() { // se le condizioni sono soddisfatte, aumento di un mese il calendario e ripeto il render
        if (this.annoCorrente < this.annoMassimo || (this.annoCorrente === this.annoMassimo && this.meseCorrente < 11)) { // l'anno deve essere nel range (attuale | attuale + 2) oppure il mese non deve far superare l'anno massimo
            this.meseCorrente++;
            if (this.meseCorrente > 11) {
                this.meseCorrente = 0;
                this.annoCorrente++;
            }
			const riepilogo1 = document.getElementById("riepilogo_1");
			const riepilogo2 = document.getElementById("riepilogo_2");
			const riepilogo3 = document.getElementById("riepilogo_3");
			const formCancellazione = document.getElementById("formCancellazione");
			if (riepilogo1) riepilogo1.classList.remove('attiva');
			if (riepilogo2) riepilogo2.classList.remove('attiva');
			if (riepilogo3) riepilogo3.classList.remove('attiva');
			if (formCancellazione) formCancellazione.classList.add('chiuso');
            this.renderCalendario();
        }
    }

    mesePrec() { // se le condizioni sono soddisfatte, diminuisco di un mese il calendario e ripeto il render
        if (this.annoCorrente > this.oggi.getFullYear() || (this.annoCorrente === this.oggi.getFullYear() && this.meseCorrente > this.oggi.getMonth())) { // l'anno deve essere maggiore di quello attuale oppure il mese non deve far superare l'anno attuale
            this.meseCorrente--;
            if (this.meseCorrente < 0) {
                this.meseCorrente = 11;
                this.annoCorrente--;
            }
			const riepilogo1 = document.getElementById("riepilogo_1");
			const riepilogo2 = document.getElementById("riepilogo_2");
			const riepilogo3 = document.getElementById("riepilogo_3");
			const formCancellazione = document.getElementById("formCancellazione");
			if (riepilogo1) riepilogo1.classList.remove('attiva');
			if (riepilogo2) riepilogo2.classList.remove('attiva');
			if (riepilogo3) riepilogo3.classList.remove('attiva');
			if (formCancellazione) formCancellazione.classList.add('chiuso');
            this.renderCalendario();
        }
    }

    selezionaGiorno(elemento) { // al click sul div del giorno manda come parametro la data in formato dd/mm/yyyy al metodo popolaOrari
        if (!elemento.classList.contains('disabilitato')) {
			const selezionePrecedente = this.contenitore.querySelector('.giorni .selezionato'); // trovo l'elemento selezionato e rimuovo la classe
			if (selezionePrecedente) {
				selezionePrecedente.classList.remove('selezionato');
			}

			elemento.classList.add('selezionato'); // aggiungo la classe selezionato al nuovo elemento
			this.popolaOrari(`${elemento.dataset.data}`);
        }
    }
	
	selezionaOrario(elemento, data) { // al click sul div del giorno manda come parametro la data e ora al metodo ....
        if (!elemento.classList.contains('disabilitato')) {
			this.resetFormPrenotazione();
			const riepilogo1 = document.getElementById("riepilogo_1");
			const riepilogo2 = document.getElementById("riepilogo_2");
			const riepilogo3 = document.getElementById("riepilogo_3");
			const formCancellazione = document.getElementById("formCancellazione");
			if (riepilogo1) riepilogo1.classList.remove('attiva');
			if (riepilogo2) riepilogo2.classList.add('attiva');
			if (riepilogo3) riepilogo3.classList.remove('attiva');
			if (formCancellazione) formCancellazione.classList.add('chiuso');
			const dataOra = document.getElementById("data-ora");
			if (dataOra) {
				dataOra.innerText = `Prenotazione per il ${data} alle ${elemento.dataset.orario}`;
				dataOra.setAttribute('data', data);
				dataOra.setAttribute('ora', elemento.dataset.orario);
			}
        }
    }
	
	popolaOrari(data) {
		const riepilogo1 = document.getElementById("riepilogo_1");
		const riepilogo2 = document.getElementById("riepilogo_2");
		const riepilogo3 = document.getElementById("riepilogo_3");
		const formCancellazione = document.getElementById("formCancellazione");

		if (riepilogo1) riepilogo1.classList.add('attiva');
		if (riepilogo2) riepilogo2.classList.remove('attiva');
		if (riepilogo3) riepilogo3.classList.remove('attiva');
		if (formCancellazione) formCancellazione.classList.add('chiuso');

		if (!riepilogo1) return;

		const _data = this.formattaData(data, "Ymd");
		const orariPranzo = riepilogo1.querySelectorAll(".orari")[0];
		const orariCena = riepilogo1.querySelectorAll(".orari")[1];

		// pulisco le sezioni orari prima di renderizzare
		orariPranzo.innerHTML = '';
		orariCena.innerHTML = '';
		
		const popolaOrariPerDiv = (orariDiv, orariArray, _data) => {
			
			const prenotazioniDelGiorno = (this.prenotazioni[this.formattaData(data, "m")]?.prenotazioni || []).filter(prenotazione => {
				return prenotazione.data === _data; // filtra gli orari per la data selezionata
			});
			
			orariArray.forEach(orario => {
				const bottone = document.createElement("button");
				bottone.textContent = orario;
				bottone.className = "col";
				bottone.dataset.orario = orario;
				
				if (!this.prenotazioniRandom[_data]) { // inizializza la struttura dati
					this.prenotazioniRandom[_data] = {};
				}
				
				if (this.prenotazioniRandom[_data][orario] === undefined) { // se non esiste o è definito e l'orario è disabilitato randomicamente
					if (Math.random() < 0.3) { // 30% di probabilità di disabilitare un orario
						bottone.classList.add('disabilitato');
						this.prenotazioniRandom[_data][orario] = true; // salva lo stato come disabilitato
					} else {
						this.prenotazioniRandom[_data][orario] = false; // salva lo stato come non disabilitato
					}
				} else {
					if (this.prenotazioniRandom[_data][orario]) { // se lo stato è true disabilita
						bottone.classList.add('disabilitato');
					}
				}
				
				const prenotazione = prenotazioniDelGiorno.find(p => p.ora === `${orario}:00`);
				if (prenotazione && prenotazione.count >= this.prenotazioniMassime) { // disabilita l'orario se il numero di prenotazioni raggiunge o supera il limite massimo
					bottone.classList.add('disabilitato');
				}
				
				bottone.addEventListener('click', () => this.selezionaOrario(bottone, data));
				orariDiv.appendChild(bottone);
			});
		};		
		
		// separazione orari per pranzo e cena
		popolaOrariPerDiv(orariPranzo, this.orari.filter(orario => parseInt(orario.split(":")[0], 10) < 19), _data);
		popolaOrariPerDiv(orariCena, this.orari.filter(orario => parseInt(orario.split(":")[0], 10) >= 19), _data);
	}
		
	verificaPrenotazioni(_data) {
		if (!this.prenotazioni[this.formattaData(_data, "m")]) { // se il valore non è già stato richiesto procedi, altrimenti evita inutili ripetizioni
			try { // fetch post a php dei valori [data] con response in json
				fetch('php/verificaPrenotazioni.php', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						data: _data
					}),
				})
				.then(response => response.json())
				.then(data => {
					if (data.error) {
						if(data.errorData) {
							console.error("Errore:", data.errorData.errorInfo);
						} else {
							console.error("Errore:", data.error);
						}
					} else {
						this.prenotazioni[this.formattaData(_data, "m")] = { prenotazioni: data.data.prenotazioni };
					}
				})
            } catch (error) {
                console.error("Errore:", error);
            }
		}
		return this.prenotazioni[this.formattaData(_data, "m")];
	}
	
	resetFormPrenotazione(emailValue = "", nomeValue = "", ospitiValue = "") {
		const email = document.getElementById("email");
		const nome = document.getElementById("nome");
		const ospiti = document.getElementById("ospiti");
		const validaEmail = document.getElementById("validaEmail");
		const validaNome = document.getElementById("validaNome");
		const validaOspiti = document.getElementById("validaOspiti");
		const formReturn = document.getElementById("form-return");
		const formSubmit = document.getElementById("formSubmit");
		if (email) {
			email.value = emailValue;
			email.classList.remove('form-invalid');
		}
		if (nome) { 
			nome.value = nomeValue;
			nome.classList.remove('form-invalid');
		}
		if (ospiti) { 
			ospiti.value = ospitiValue;
			ospiti.classList.remove('form-invalid');
		}
		if (validaEmail) {
			validaEmail.innerText = "";
		}
		if (validaNome) {
			validaNome.innerText = "";
		}
		if (validaOspiti) {
			validaOspiti.innerText = "";
		}
		if (formReturn) { 
			formReturn.innerText = "";
			formReturn.classList.remove('return-invalid');
			formReturn.classList.remove('return-valid');
		}
		if (formSubmit) {
			formSubmit.disabled = false;
			formSubmit.classList.remove('disabilitato');
		}
	}
	
	resetFormCancellazione(emailValue = "", codiceValue = "") {
		const email = document.getElementById("emailCancellazione");
		const codice = document.getElementById("codiceCancellazione");
		const validaEmail = document.getElementById("validaEmailCancellazione");
		const validaCodice = document.getElementById("validaCodiceCancellazione");
		const formReturn = document.getElementById("form-cancellazione-return");
		if (email) {
			email.value = emailValue;
			email.classList.remove('form-invalid');
		}
		if (codice) { 
			codice.value = codiceValue;
			codice.classList.remove('form-invalid');
		}
		if (validaEmail) {
			validaEmail.innerText = "";
		}
		if (validaCodice) {
			validaCodice.innerText = "";
		}
		if (formReturn) { 
			formReturn.innerText = "";
			formReturn.classList.remove('return-invalid');
			formReturn.classList.remove('return-cancellazione-valid');
		}
	}
		
	gestisciFormPrenotazione() {
        const form = document.getElementById("formPrenotazione");
        if (!form) return;
			
		const email = document.getElementById("email");
		const nome = document.getElementById("nome");
		const ospiti = document.getElementById("ospiti");
		const validaEmail = document.getElementById("validaEmail");
		const validaNome = document.getElementById("validaNome");
		const validaOspiti = document.getElementById("validaOspiti");
		const formReturn = document.getElementById("form-return");
		const dataOra = document.getElementById("data-ora");
		const formSubmit = document.getElementById("formSubmit");
		
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
			
			var validaForm = true;
			let dataPrenotazione = dataOra.getAttribute('data');
			let oraPrenotazione = dataOra.getAttribute('ora');
			this.resetFormPrenotazione(email.value, nome.value, ospiti.value);
			
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email.value)) { // test regex per mail formato x@x.x
				validaEmail.innerText = "Inserisci un'email valida"
				email.classList.add('form-invalid');
                validaForm = false;
            }
			
			if (nome.value.length < 1) { // il campo nome deve contenere almeno 1 carattere
                validaNome.innerText = "Inserisci il tuo nome";
				nome.classList.add('form-invalid');
                validaForm = false;
            }

            if (ospiti.value < 1 || ospiti.value > 8) { // gli ospiti devono essere compresi tra 1 e 8
                validaOspiti.innerText = "Ospiti consentiti da 1 e 8";
				ospiti.classList.add('form-invalid');
                validaForm = false;
            }
			
			if(!validaForm){ // se almeno uno dei 3 controlli non è passato invalida il form
				return;
			}
			
			try { // fetch post a php dei valori [email, nome, data, ora e ospiti] con response in json
				fetch('php/prenota.php', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: email.value,
						nome: nome.value,
						data: dataPrenotazione,
						ora: oraPrenotazione,
						ospiti: ospiti.value
					}),
				})
				.then(response => response.json())
				.then(data => {
					if (data.error) {
						if(data.errorData){
							console.error("Errore:", data.errorData.errorInfo);
							formReturn.innerText = "Si è verificato un errore interno";
						} else {
							formReturn.innerText = data.error;
						}
						formReturn.classList.add('return-invalid');
					} else {
						this.resetFormPrenotazione();
						formReturn.innerText = data.message;
						formReturn.classList.add('return-valid');
						formSubmit.disabled = true;
						formSubmit.classList.add('disabilitato');
						if (this.prenotazioni[this.formattaData(dataPrenotazione, "m")]) {
							delete this.prenotazioni[this.formattaData(dataPrenotazione, "m")]; // rimuove la chiave e i relativi dati forzando il refresh degli orari
						}
						this.renderCalendario();
					}
				})
            } catch (error) {
                console.error("Errore:", error);
            }
        });
    }
	
	espandiCancellaPrenotazione(){
		const riepilogo1 = document.getElementById("riepilogo_1");
		const riepilogo2 = document.getElementById("riepilogo_2");
		const riepilogo3 = document.getElementById("riepilogo_3");
		const formCancellazione = document.getElementById("formCancellazione");
		if (riepilogo1) riepilogo1.classList.remove('attiva');
		if (riepilogo2) riepilogo2.classList.remove('attiva');
		if (riepilogo3) riepilogo3.classList.add('attiva');
		if (formCancellazione) formCancellazione.classList.remove('chiuso');
	}
	
	gestisciFormCancellazione() {
        const form = document.getElementById("formCancellazione");
        if (!form) return;
			
		const email = document.getElementById("emailCancellazione");
		const codice = document.getElementById("codiceCancellazione");
		const validaEmail = document.getElementById("validaEmailCancellazione");
		const validaCodice = document.getElementById("validaCodiceCancellazione");
		const formReturn = document.getElementById("form-cancellazione-return");
		const formSubmit = document.getElementById("formSubmitCancellazione");
		
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
			
			var validaForm = true;
			this.resetFormCancellazione(email.value, codice.value);
			
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email.value)) { // test regex per mail formato x@x.x
				validaEmail.innerText = "Inserisci un'email valida"
				email.classList.add('form-invalid');
                validaForm = false;
            }
			
			if (codice.value.length !== 8) { // il campo codice deve contenere 8 caratteri
                validaCodice.innerText = "Codice non valido";
				codice.classList.add('form-invalid');
                validaForm = false;
            }
			
			if(!validaForm){ // se almeno uno dei 2 controlli non è passato invalida il form
				return;
			}
			
			try { // fetch post a php dei valori [email, codice] con response in json
				fetch('php/cancella.php', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: email.value,
						codice: codice.value
					}),
				})
				.then(response => response.json())
				.then(data => {
					if (data.error) {
						if(data.errorData) {
							console.error("Errore:", data.errorData.errorInfo);
							formReturn.innerText = "Si è verificato un errore interno";
						} else {
							formReturn.innerText = data.error;
						}
						formReturn.classList.add('return-invalid');
					} else {
						this.resetFormCancellazione();
						formReturn.innerHTML = `
							<div class="form-group">
								<p>Gentile ${data.data.nome}, ci dispiace non averti nostro ospite!</p>
								<span>Prenotazione cancellata per il giorno ${data.data.data} alle ore ${data.data.ora}</span>
							</div>
						`;
						formReturn.classList.add('return-cancellazione-valid');
						if (this.prenotazioni[this.formattaData(data.data.data, "m")]) {
							delete this.prenotazioni[this.formattaData(data.data.data, "m")]; // rimuove la chiave e i relativi dati forzando il refresh degli orari
						}
						this.renderCalendario();
					}
				})
            } catch (error) {
                console.error("Errore:", error);
            }
        });
    }
}

const calendario = new Calendario('.calendario');

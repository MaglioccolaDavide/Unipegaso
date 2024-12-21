class Calendario {
    constructor(contenitore) {
        this.contenitore = document.querySelector(contenitore);
        this.oggi = new Date(); // data odierna 
        this.meseCorrente = this.oggi.getMonth(); // mese corrente
        this.annoCorrente = this.oggi.getFullYear(); // anno corrente
        this.annoMassimo = this.annoCorrente + 2; // 2 anni nel futuro a partire da oggi
        this.nomiMesi = [ "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre" ]; // array nomi mesi
		
		this.randomGiorni = this.generaRandomGiorni();
		this.randomOrari = {};
		
        this.inizializza();
    }
	
	generaRandomGiorni() { // genera un json con coppia valori randomSalta e randomOccupa per ogni mese-anno
        const mapping = {};
        let mese = this.meseCorrente;
        let anno = this.annoCorrente;

        for (var i = 0; i <= 24; i++) { 
            const chiave = `${anno}-${mese + 1}`; 

            mapping[chiave] = {
                randomSalta: Math.floor(Math.random() * 10), // variabile random da 0 a 9 per simulare i giorni liberi
                randomOccupa: Math.floor(Math.random() * 4) // variabile random da 0 a 3 per simulare i giorni occupati
            };

            mese++;
            if (mese > 11) {
                mese = 0;
                anno++;
            }
        }

        return mapping;
    }
	
	generaRandomOrari(data) { // genera un json con coppia valori randomSalta e randomOccupa per pranzo e cena per ogni data
        if (!this.randomOrari[data]) {
            this.randomOrari[data] = {
                pranzo: {
                    randomSalta: Math.floor(Math.random() * 5), // variabile random da 0 a 4 per simulare gli orari liberi a pranzo
                    randomOccupa: Math.floor(Math.random() * 4) // variabile random da 0 a 3 per simulare gli orari occupati a pranzo
                },
                cena: {
                    randomSalta: Math.floor(Math.random() * 5), // variabile random da 0 a 4 per simulare gli orari liberi a cena
                    randomOccupa: Math.floor(Math.random() * 4) // variabile random da 0 a 3 per simulare gli orari occupati a cena
                }
            };
        }
        return this.randomOrari[data];
    }
	
	ottieniRandom(mese, anno) {
        const chiave = `${anno}-${mese + 1}`;
        return this.randomGiorni[chiave];
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
            <div class="giorni"></div>
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

        giorniEl.innerHTML = '';
		
		const { randomSalta, randomOccupa } = this.ottieniRandom(this.meseCorrente, this.annoCorrente); // ottengo i valori in base al mese-anno
				
		var giorniDisabilitati = 0; // contatore giorni occupati
		var saltaContatore = 0; // contatore giorni da saltare

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
            }  else {
				if (giorniDisabilitati > 0) { // se sono presenti giorni da disabilitare aggiungo la classe e riduco il contatore
					giornoEl.classList.add('disabilitato');
					giorniDisabilitati--;
				} else if (saltaContatore === randomSalta && saltaContatore != 0) { //se i giorni da saltare sono finiti
					saltaContatore = 0; // resetto il contatore di salto
					giorniDisabilitati = randomOccupa; // imposto i giorni da occupare
					giornoEl.classList.add('disabilitato'); // disabilito il giorno
					giorniDisabilitati--; // riduco il contatore di un giorno
				} else {
					saltaContatore++;
				}
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
			calendario.popolaOrari(`${elemento.dataset.data}`);
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
		const random = this.generaRandomOrari(data);
		
		if (riepilogo1) riepilogo1.classList.add('attiva');
		if (riepilogo2) riepilogo2.classList.remove('attiva');
		if (riepilogo3) riepilogo3.classList.remove('attiva');
		if (formCancellazione) formCancellazione.classList.add('chiuso');

		if (!riepilogo1) return;

		const orariPranzo = riepilogo1.querySelectorAll(".orari")[0];
		const orariCena = riepilogo1.querySelectorAll(".orari")[1];

		// pulisco la sezione orari prima di renderizzare
		orariPranzo.innerHTML = '';
		orariCena.innerHTML = '';

		var saltaContatorePranzo = 0; // contatore orari da saltare pranzo
		var occupaContatorePranzo = 0; // contatore orari occupati pranzo

		for (var ora = 12; ora <= 14; ora++) { // creo un bottone ogni 30 minuti a partire dalle 12 fino alle 14
			const minuti = ora === 14 ? [0] : [0, 30];
			minuti.forEach(minuto => {
				const bottone = document.createElement("button");
				bottone.textContent = `${ora}:${minuto.toString().padStart(2, "0")}`;
				bottone.className = "col";
				bottone.dataset.orario = `${ora}:${minuto.toString().padStart(2, "0")}`;

				if (saltaContatorePranzo === random.pranzo.randomSalta && saltaContatorePranzo != 0) {
					saltaContatorePranzo = 0;
					occupaContatorePranzo = random.pranzo.randomOccupa;
				}

				if (occupaContatorePranzo > 0) {
					bottone.classList.add('disabilitato');
					occupaContatorePranzo--;
				} else {
					saltaContatorePranzo++;
				}
				
				bottone.addEventListener('click', () => this.selezionaOrario(bottone, data)); // aggiungo un listener al click sul bottone
				orariPranzo.appendChild(bottone);
			});
		}

		var saltaContatoreCena = 0;  // contatore orari da saltare cena
		var occupaContatoreCena = 0; // contatore orari occupati cena

		for (var ora = 19; ora <= 22; ora++) { // creo un bottone ogni 30 minuti a partire dalle 19 fino alle 22
			const minuti = ora === 22 ? [0] : [0, 30];
			minuti.forEach(minuto => {
				const bottone = document.createElement("button");
				bottone.textContent = `${ora}:${minuto.toString().padStart(2, "0")}`;
				bottone.className = "col";
				bottone.dataset.orario = `${ora}:${minuto.toString().padStart(2, "0")}`;

				if (saltaContatoreCena === random.cena.randomSalta && saltaContatoreCena != 0) {
					saltaContatoreCena = 0;
					occupaContatoreCena = random.cena.randomOccupa;
				}

				if (occupaContatoreCena > 0) {
					bottone.classList.add('disabilitato');
					occupaContatoreCena--;
				} else {
					saltaContatoreCena++;
				}

				bottone.addEventListener('click', () => this.selezionaOrario(bottone, data)); // aggiungo un listener al click sul bottone
				orariCena.appendChild(bottone);
			});
		}
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
						console.log(data.data);
					}
				})
            } catch (error) {
                console.error("Errore:", error);
            }
        });
    }
}

const calendario = new Calendario('.calendario');

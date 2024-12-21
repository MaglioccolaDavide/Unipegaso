class Menu {
  constructor(data) {
    this.data = data;
  }

  creaSezione(categoria, piatti) {
    const div = document.createElement('div');
    div.classList.add('col-xl-6');

    const titolo = document.createElement('h4');
    titolo.textContent = categoria;
    div.appendChild(titolo);

    piatti.forEach(piatto => {
      const divRiga = document.createElement('div');
      divRiga.classList.add('row', 'flex-nowrap');

      const divDescrizione = document.createElement('div');
      divDescrizione.classList.add('col-9', 'menu-item-piatto');

      const descrizionePiatto = document.createElement('p');
      descrizionePiatto.textContent = piatto.piatto;
      divDescrizione.appendChild(descrizionePiatto);

      const divPrezzo = document.createElement('div');
      divPrezzo.classList.add('col-3', 'menu-item-prezzo');
      divPrezzo.textContent = piatto.prezzo;

      divRiga.appendChild(divDescrizione);
      divRiga.appendChild(divPrezzo);

      div.appendChild(divRiga);
    });

    return div;
  }

  generaMenu(containerId) {
    const container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    for (const [categoria, piatti] of Object.entries(this.data)) {
      const sezione = this.creaSezione(categoria, piatti);
      container.appendChild(sezione);
    }
  }
}

const menuData = {
  "ANTIPASTI": [
    { piatto: "Radicchio tardivo trevigiano con aceto tradizionale invecchiato, mele rosse, melograno, nocciole, pecorino e pandoro croccante", prezzo: 20 },
    { piatto: "Zucca mantovana in crema e marinata, tomino di capra fondente del Boscasso, semi di zucca e cerfoglio", prezzo: 20 },
    { piatto: "Trota affumicata dell’Adamello, radicchio veronese e insalata capricciosa", prezzo: 22 }
  ],
  "PRIMI": [
    { piatto: "Tortelloni di zucca e amaretto, burro cotto e mostarda cremonese", prezzo: 25 },
    { piatto: "Risotto alla parmigiana e aceto tradizionale di Modena invecchiato", prezzo: 24 },
    { piatto: "Pizzoccheri di grano saraceno gratinati al forno e fonduta di parmigiano", prezzo: 22 },
    { piatto: "Pappardelle di farina di castagne, ragù di salsiccia e rosmarino croccante", prezzo: 24 }
  ],
  "SECONDI": [
    { piatto: "Filetto di trota al pepe verde e cime di rapa ripassate", prezzo: 29 },
    { piatto: "Gulasch di fassona piemontese con purè di patate di montagna", prezzo: 26 },
    { piatto: "Cervo gratinato Whisky, Noci Macadamia, consistenze di Rapa rossa", prezzo: 41 },
    { piatto: "Carpaccio di capriolo marinato e scottato, rape in agrodolce e maionese al rafano", prezzo: 32 },
    { piatto: "Controfiletto di vitello in crosta di radicchio di Treviso e salsa al tartufo nero", prezzo: 37 }
  ],
  "DESSERT": [
    { piatto: "Cremoso al cioccolato fondente, gelato al frutto della passione, rapa, peperoncino e pepe rosa", prezzo: 15 },
    { piatto: "Panettone al cioccolato e albicocca caldo con spuma al cioccolato", prezzo: 12 },
    { piatto: "Torta di rose ai limoni di Sorrento e gelato alla vaniglia", prezzo: 14 },
    { piatto: "Gelati o sorbetti di frutta locale", prezzo: 8 }
  ]
};

const menu = new Menu(menuData);
menu.generaMenu('menu-container');

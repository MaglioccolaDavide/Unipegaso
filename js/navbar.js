function toggleNavBar() {
	const navbarNav = document.getElementById('navbarNav');
	if (navbarNav.classList.contains('show')) {
		navbarNav.classList.remove('show'); // chiude il menu se aperto
	} else {
		navbarNav.classList.add('show'); // mostra il menu se chiuso
	}
}

document.addEventListener('click', function (event) {
	const navbarNav = document.getElementById('navbarNav');
	if (!navbarNav.contains(event.target) && !document.querySelector('.navbar-toggler').contains(event.target)) {
		navbarNav.classList.remove('show'); // chiude il menu se clicchi fuori
	}
});

// chiude il menu quando si seleziona un link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(function (link) {
	link.addEventListener('click', function () {
		document.getElementById('navbarNav').classList.remove('show'); // chiude il menu
	});
});
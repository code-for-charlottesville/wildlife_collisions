import counties_list from '../assets/counties_list.json';
import {setupConfig, config, isConfigValid} from "./config.js";

const animalForm = document.querySelector('.animal-intake');
const stateList = document.getElementById('state');
const states = [...new Set(counties_list.map((x) => x.State))]; // using json for better reliability


export function initialize() {
	setupConfig();
	// Load states into dropdown options
	let stateOptions = document.getElementById('state');
	states.map((x) => {
		let opt = document.createElement('option');
		opt.value = x;
		opt.innerHTML = x;
		stateOptions.appendChild(opt);
	});
	stateList.addEventListener('change', handleJurisdictionChange);
	animalForm.addEventListener('submit', handleSubmitData);
}



async function handleJurisdictionChange(event) {
	const counties = counties_list.filter((x) => {
		return x.State === event.target.value;
	});

	counties.sort((a, b) => {
		const countyA = a.County.toUpperCase();
		const countyB = b.County.toUpperCase();
		if (countyA < countyB) {
			return -1;
		}
		if (countyA > countyB) {
			return 1;
		}
		return 0;
	});

	// Delete any county (jurisdiction) options from the dropdown first
	let jurisdiction = document.getElementById('jurisdiction');
	while (jurisdiction.firstChild) {
		jurisdiction.removeChild(jurisdiction.firstChild);
	}
	// Add county (jurisdiction) options to the dropdown
	let firstOpt = document.createElement('option');
	firstOpt.value = '';
	firstOpt.innerHTML = 'Choose...';
	firstOpt.disabled = true;
	firstOpt.selected = true;
	jurisdiction.appendChild(firstOpt);
	counties.map((x) => {
		let opt = document.createElement('option');
		opt.value = x.County;
		opt.innerHTML = x.County;
		jurisdiction.appendChild(opt);
	});
}


async function handleSubmitData(event) {
	event.preventDefault();
	const formData = new FormData(event.target);
	animalForm.classList.add('was-validated');

	if (!animalForm.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		animalForm.scrollIntoView({ behavior: 'smooth' });
	} else {
		let formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSeyfnaSeydze_BR8caGisyHKUZfgcQveuBJtiWCpK51ypDwvg/formResponse?submit=Submit?usp=pp_url';
		//   Concatenate the google form URL with responses from the intake form and replace spaces with addition signs (+) for submission.
		let responseURL = formURL + config.getUrlTags(formData);
		responseURL = responseURL.replace(/ /g, '+');
		await fetch(responseURL, { method: 'POST', mode: 'no-cors' })
			// comment the .then out if you want to see debug from this function
			// otherwise, it will redirect when you submit
			.then( () => window.location.href = "submitted.html");
	}
}



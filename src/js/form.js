import counties_list from '../assets/counties_list.json';
import 'bootstrap/dist/css/bootstrap.min.css';

import { setupConfig, config, isConfigValid } from './config.js';
import './dropdowntree.js';
let arr = require('../assets/rescuecircumstance.json');

const animalForm = document.querySelector('.animal-intake');
const stateList = document.getElementById('state');
const states = [...new Set(counties_list.map((x) => x.state_name))]; // using json for better reliability

states.sort((a, b) => {
	const stateA = a.toUpperCase();
	const stateB = b.toUpperCase();
	if (stateA < stateB) {
		return -1;
	}
	if (stateA > stateB) {
		return 1;
	}
	return 0;
});

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
		return x.state_name === event.target.value;
	});
	counties.sort((a, b) => {
		const countyA = a.county.toUpperCase();
		const countyB = b.county.toUpperCase();
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
		opt.value = x.county;
		opt.innerHTML = x.county;
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
		let baseUrl = 'https://docs.google.com/forms/d/e/';
		let submitTags = '/formResponse?submit=Submit?usp=pp_url';
		//   Concatenate the google form URL with responses from the intake form and replace spaces with addition signs (+) for submission.
		let responseURL = baseUrl + config.form_url + submitTags + config.getUrlTags(formData);
		responseURL = responseURL.replace(/ /g, '+');

		await fetch(responseURL, { method: 'POST', mode: 'no-cors' })
			// comment the .then out if you want to see debug from this function
			// otherwise, it will redirect when you submit
			.then((response) => {
				if (response.ok) {
					window.location.href = 'submitted.html'
				}
				else{
					alert("Something went wrong, try again. If the problem persists, check that the site is configured properly.")
					throw new Error('Form failed to submit');
				}
			});
	}
}

var options = {
	title: 'Choose...',
	data: arr,
	maxHeight: 500,
	closedArrow: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
	openedArrow: '<i class="fa fa-caret-down" aria-hidden="true"></i>',
	multiSelect: true,
	selectChildren: false,
};

$('#firstDropDownTree').DropDownTree(options);

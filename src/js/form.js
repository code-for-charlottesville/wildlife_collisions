import counties_list from '../assets/counties_list.json';
import 'bootstrap/dist/css/bootstrap.min.css';

import { setupConfig, config, isConfigValid } from './config.js';
import './dropdowntree.js';
let arr = require('../assets/rescuecircumstance.json')

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
		let baseUrl = 'https://docs.google.com/forms/d/e/';
		let submitTags = '/formResponse?submit=Submit?usp=pp_url';
		//   Concatenate the google form URL with responses from the intake form and replace spaces with addition signs (+) for submission.
		let responseURL = baseUrl + config.formUrl + submitTags + config.getUrlTags(formData);
		responseURL = responseURL.replace(/ /g, '+');
		await fetch(responseURL, { method: 'POST', mode: 'no-cors' })
			// comment the .then out if you want to see debug from this function
			// otherwise, it will redirect when you submit
			.then(
				() => (window.location.href = 'submitted.html'),
				() => console.log('Failed.')
			);
	}
}

var options = {
	title: 'Circumstances of Rescue...',
	data: arr,
	maxHeight: 500,
	clickHandler: function (element) {
		$('#firstDropDownTree').SetTitle($(element).find('a').first().text());
	},
	expandHandler: function (element, expanded) {},
	checkHandler: function (element, checked) {
		this.expandHandler(element);
	},
	closedArrow: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
	openedArrow: '<i class="fa fa-caret-down" aria-hidden="true"></i>',
	multiSelect: true,
	selectChildren: false,
};

$('#firstDropDownTree').DropDownTree(options);
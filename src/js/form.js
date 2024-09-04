import $ from 'jquery';
import { html } from 'jquery';
import counties_list from '../assets/counties_list.json';

const animalForm = document.querySelector('.animal-intake');
const stateList = document.getElementById('state');
const states = [...new Set(counties_list.map((x) => x.State))];

export function initialize() {
	// $.getJSON('http://anyorigin.com/get?url=http://docs.google.com/forms/d/e/1FAIpQLSc1HS1p1aGzZVWm53Mp0hGclQ4hvlUu0R8WxgIRS1k9zvr1Wg/viewform?embedded=true&callback=?', function(data){
	//     console.log(data);
	//     //$('#output').html(data.contents);
	// });

	let url = 'https://docs.google.com/forms/d/e/1FAIpQLSc1HS1p1aGzZVWm53Mp0hGclQ4hvlUu0R8WxgIRS1k9zvr1Wg/viewform';
	let out = document.getElementById('out');
	// fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
	// 	.then((response) => {
	// 		if (response.ok) return response.json();
	// 		throw new Error('Network response was not ok.');
	// 	})
	// 	.then((data) => {
	// 		//   console.log(data.contents);
	// 		const htmlOut = $.parseHTML(data.contents.html);
	// 		$('out').html(htmlOut);
	// 	});

	// Load states into dropdown options
	let stateOptions = document.getElementById('state');
	states.map((x) => {
		let opt = document.createElement('option');
		opt.value = x;
		opt.innerHTML = x;
		stateOptions.appendChild(opt);
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
		let Q1 = `&entry.1880641450=${formData.get('date-found')}`;
		let Q2 = `&entry.736217316=${formData.get('time-found')}`;
		let Q3 = `&entry.1677807282=${formData.get('date-admit')}`;
		let Q4 = `&entry.1056081713=${formData.get('time-admit')}`;
		let Q5 = `&entry.1013315720=${formData.get('details')}`;
		let Q6 = `&entry.1019285528=${formData.get('care')}`;
		let Q7 = `&entry.314191277=${formData.get('circumstance')}`;
		let Q8 = `&entry.354181122=${formData.get('state')}`;
		let Q9 = `&entry.1184438901=${formData.get('jurisdiction')}`;
		let Q10 = `&entry.1965312133=${formData.get('latitude')}`;
		let Q11 = `&entry.476740891=${formData.get('longitude')}`;

		//   Concatenate the google form URL with responses from the intake form and replace spaces with addition signs (+) for submission.
		let responseURL = formURL + Q1 + Q2 + Q3 + Q4 + Q5 + Q6 + Q7 + Q8 + Q9 + Q10 + Q11;
		responseURL = responseURL.replace(/ /g, '+');
		// console.log(responseURL);

		const response = await fetch(responseURL, { method: 'POST', mode: 'no-cors' });
	}
}

async function handleJurisdictionChange(event) {
	const counties = counties_list.filter((x) => {
		return x.State == event.target.value;
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
	var i,
		L = jurisdiction.options.length - 1;
	for (i = L; i >= 0; i--) {
		jurisdiction.remove(i);
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

stateList.addEventListener('change', handleJurisdictionChange);
animalForm.addEventListener('submit', handleSubmitData);

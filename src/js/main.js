import 'bootstrap/dist/css/bootstrap.min.css';
import { LinkedEntry } from './types';
import { initialize } from './form';
import { Loader } from '@googlemaps/js-api-loader';

let map,
	count = 0,
	currentMarker;

const loader = new Loader({
	apiKey: 'AIzaSyAbNIZJ6yPGyFNUg93aBFaXfxnvHDY8B4Y',
	version: 'weekly',
});

const LAT = document.getElementById('latitude');
const LONG = document.getElementById('longitude');
const Jurisdiction = document.getElementById('jurisdiction');

loader.load().then(async () => {
	const { Map } = await google.maps.importLibrary('maps');
	const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

	map = new Map(document.getElementById('map'), {
		center: { lat: 38.033554, lng: -78.50798 },
		zoom: 10,
		mapId: 'WCV_MAP_ID',
	});

	map.addListener('rightclick', (e) => {
		count++;
		if (count <= 1) {
			placeMarker(e.latLng, map);
		} else {
			count = 0;
			currentMarker.setMap(null);
			LAT.value = null;
			LONG.value = null;
		}
	});

	function placeMarker(latLng, map) {
		currentMarker = new AdvancedMarkerElement({
			position: latLng,
			map: map,
		});
		map.panTo(latLng);
		LAT.value = latLng.toJSON().lat;
		LONG.value = latLng.toJSON().lng;
	}
});

function recenterMap() {
	const geocoder = new google.maps.Geocoder();
	var county = document.getElementById('jurisdiction').value;
	var state = document.getElementById('state').value;
	geocoder.geocode({ address: `${county}, ${state}` }, function (results, status) {
		if (status == 'OK') {
			map.setCenter(results[0].geometry.location, 8);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

Jurisdiction.addEventListener('change', recenterMap);

initialize();

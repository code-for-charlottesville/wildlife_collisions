import { initialize } from './form';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import "leaflet.fullscreen";

let map = L.map('map', {
	fullscreenControl: true,
	fullscreenControlOptions: {
		position: 'topleft'
	}
}).setView([38.033554, -78.50798], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var markerGroup = L.layerGroup().addTo(map);
map.on('click', addMarker);

function addMarker(e) {
	markerGroup.clearLayers();
	L.marker(e.latlng).addTo(markerGroup).bindPopup('Animal found here').openPopup();

	// Populate latitude and longitude data to the form
	const LAT = document.getElementById('latitude');
	const LNG = document.getElementById('longitude');
	LAT.value = e.latlng.lat;
	LNG.value = e.latlng.lng;

	////////////////////////////////////////////////////////////////////////////////////////
	// The default marker image does not load throwing a 404 error.
	// This is a known issue with leaflet: https://github.com/Leaflet/Leaflet/issues/4968
	// Below is one solution implemented changing the src attribute of the element.
	////////////////////////////////////////////////////////////////////////////////////////
	const imgElementMarker = document.querySelector('.leaflet-marker-shadow');
	// Change the src attribute of the image
	if (imgElementMarker) {
		imgElementMarker.src = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png ';
	}
	const imgElement = document.querySelector('.leaflet-marker-icon');
	// Change the src attribute of the image
	if (imgElement) {
		imgElement.src = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
	}
}

initialize();

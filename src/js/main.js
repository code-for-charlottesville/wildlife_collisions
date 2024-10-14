import { initialize } from './form';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import leaflet.fullscreenControl
import leaflet.fullscreenControlOptions

var map = L.map('map').setView([38.033554, -78.50798], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
// create a fullscreen button and add it to the map
L.control
	.fullscreen({
		title: 'Show me the fullscreen !', // change the title of the button, default Full Screen
		titleCancel: 'Exit fullscreen mode', // change the title of the button when fullscreen is on, default Exit Full Screen
		content: null, // change the content of the button, can be HTML, default null
		forceSeparateButton: true, // force separate button to detach from zoom buttons, default false
		forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
		fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
	})
	.addTo(map);

// events are fired when entering or exiting fullscreen.
map.on('enterFullscreen', function () {
	console.log('entered fullscreen');
});

map.on('exitFullscreen', function () {
	console.log('exited fullscreen');
});

// you can also toggle fullscreen from map object
//map.toggleFullscreen();

var markerGroup = L.layerGroup().addTo(map);
map.on('click', addMarker);


function centerer(int lat, int lng){
	map.setView(new L.LatLing(lat, lng),8);
}

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

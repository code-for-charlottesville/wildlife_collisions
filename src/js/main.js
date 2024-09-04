import 'bootstrap/dist/css/bootstrap.min.css';
import { LinkedEntry } from './types';
import { initialize } from './form';
import 'leaflet/dist/leaflet.css';
import { Map, TileLayer, Marker } from 'leaflet';

const map = new Map('map').setView([51.505, -0.09], 13);

new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var marker = new Marker([51.5, -0.09]).addTo(map);

initialize();

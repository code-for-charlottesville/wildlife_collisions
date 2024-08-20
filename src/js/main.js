import 'bootstrap/dist/css/bootstrap.min.css';
import { LinkedEntry } from './types';
import { initialize } from './form';
import ZOHO_CLIENT_ID from '/dist/zoho.js'

initialize();
console.log(ZOHO_CLIENT_ID);
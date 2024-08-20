import 'bootstrap/dist/css/bootstrap.min.css';
import { LinkedEntry } from './types';
import { initialize } from './form';
require('dotenv').config();

initialize();
console.log(process.env.ZOHO_CLIENT_ID);
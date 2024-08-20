import ZOHO_CLIENT_ID from '/dist/zoho.js'
const REDIRECT_URI = "https://pharingwell.github.io/wildlife_collisions/redirect"
const STATE = "A#73*&tA^KL4$394"
export function initialize() {
    let xmlHttp = new XMLHttpRequest();

    function callback(responseText) {
        console.log(responseText);
    }
    let zohoEndpoint = `https://accounts.zoho.com/oauth/v2/auth`+
        `?client_id=${ZOHO_CLIENT_ID}`+
        `&response_type=token`+
        `&redirect_uri=${REDIRECT_URI}`+
        `&scope=ZohoSheet.dataAPI.UPDATE`+
        `&state=${STATE}`
    ;
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", zohoEndpoint, true); // true for asynchronous
    xmlHttp.send(null);
}


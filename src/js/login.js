import ZOHO_CLIENT_ID from '/dist/zoho.js'
const REDIRECT_URI = "https://pharingwell.github.io/wildlife_collisions/form"
const STATE = "Aw73?&tAKL4394"
function initialize() {
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
    let srcReplace = document.getElementsByClassName("fallback")[0];
    srcReplace.setAttribute('href', zohoEndpoint);
    console.log(zohoEndpoint);
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", zohoEndpoint, true); // true for asynchronous
    xmlHttp.send(null);
}

initialize();

import $ from 'jquery';
import {html} from "jquery";

export function initialize() {
    // $.getJSON('http://anyorigin.com/get?url=http://docs.google.com/forms/d/e/1FAIpQLSc1HS1p1aGzZVWm53Mp0hGclQ4hvlUu0R8WxgIRS1k9zvr1Wg/viewform?embedded=true&callback=?', function(data){
    //     console.log(data);
    //     //$('#output').html(data.contents);
    // });

    let url = "https://docs.google.com/forms/d/e/1FAIpQLSc1HS1p1aGzZVWm53Mp0hGclQ4hvlUu0R8WxgIRS1k9zvr1Wg/viewform";
    let out = document.getElementById("out");
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        .then(response => {
            if (response.ok) return response.json()
            throw new Error('Network response was not ok.')
        })
        .then(data => {
            console.log(data.contents);
            const htmlOut = $.parseHTML(data.contents.html);
            $("out").html(htmlOut)
        });
}

